/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RootState } from '../../../../appReducer';
import BaseNpmDevice from '../basePmicDevice';
import {
    isModuleDataPair,
    MAX_TIMESTAMP,
    NpmEventEmitter,
    parseLogData,
} from '../pmicHelpers';
import {
    AdcSample,
    IrqEvent,
    LoggingEvent,
    NpmExportLatest,
    PmicDialog,
} from '../types';
import BatteryModule from './battery';
import BoostModule from './boost';
import FuelGaugeModule from './fuelGauge';
import GpioModule from './gpio';
import LdoModule, { toLdoExport } from './ldo';
import LowPowerModule from './lowPower';
import ResetModule from './reset';
import TimerModule from './timerConfig';

/* eslint-disable no-underscore-dangle */

export const npm2100FWVersion = '0.4.1+0';
export const minimumHWVersion = '0.8.0'; // TODO test with new kits once we have one!!

export default class Npm2100 extends BaseNpmDevice {
    private waitingForReset = false;
    private recentReset = false;
    constructor(
        shellParser: ShellParser | undefined,
        dialogHandler: ((pmicDialog: PmicDialog) => void) | null
    ) {
        super(
            'npm2100',
            npm2100FWVersion,
            shellParser,
            dialogHandler,
            new NpmEventEmitter(),
            {
                charger: false,
                noOfBoosts: 1,
                noOfBucks: 0,
                maxEnergyExtraction: true,
                noOfLdos: 1,
                noOfLEDs: 0,
                noOfBatterySlots: 1,
                noOfGPIOs: 2,
            },
            0,
            {
                reset: false,
                charger: false,
                sensor: false,
            }
        );

        this._ldoModule = [
            new LdoModule(
                0,
                this.shellParser,
                this.eventEmitter,
                this.sendCommand.bind(this),
                this.offlineMode
            ),
        ];

        this._gpioModule = [...Array(this.devices.noOfGPIOs).keys()].map(
            i =>
                new GpioModule(
                    i,
                    this.shellParser,
                    this.eventEmitter,
                    this.sendCommand.bind(this),
                    this.dialogHandler,
                    this.offlineMode
                )
        );

        this._fuelGaugeModule = new FuelGaugeModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this),
            this.dialogHandler,
            this.offlineMode,
            this.initializeFuelGauge.bind(this)
        );

        this._batteryModule = new BatteryModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this)
        );

        this._boostModule = [
            new BoostModule(
                this.shellParser,
                this.eventEmitter,
                this.sendCommand.bind(this),
                this.offlineMode
            ),
        ];

        this._lowPowerModule = new LowPowerModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this),
            this.offlineMode
        );

        this._resetModule = new ResetModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this),
            this.offlineMode
        );

        this._timerConfigModule = new TimerModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this),
            this.offlineMode
        );

        if (shellParser) {
            this.releaseAll.push(
                shellParser.onShellLoggingEvent(logEvent => {
                    parseLogData(logEvent, loggingEvent => {
                        switch (loggingEvent.module) {
                            case 'module_pmic':
                                this.processModulePmic(loggingEvent);
                                break;
                            case 'module_pmic_adc':
                                this.processModulePmicAdc(loggingEvent);
                                break;
                            case 'module_pmic_irq':
                                this.processModulePmicIrq(loggingEvent);
                                break;
                            case 'module_batt_input_detect':
                                this.processBattInputDetect(loggingEvent);
                                break;
                            case 'module_pmic_charger':
                                // Handled in charger callbacks
                                break;
                            case 'module_fg':
                                // Handled in fuelGauge callbacks
                                break;
                        }

                        this.eventEmitter.emit('onLoggingEvent', {
                            loggingEvent,
                            dataPair: isModuleDataPair(loggingEvent.module),
                        });
                    });
                })
            );

            this.releaseAll.push(...this._batteryModule.callbacks);
            this.releaseAll.push(...this._timerConfigModule.callbacks);
            this.releaseAll.push(...this._resetModule.callbacks);
            this.releaseAll.push(
                ...this.boostModule.map(boost => boost.callbacks).flat()
            );
            this.releaseAll.push(
                ...this.ldoModule.map(ldo => ldo.callbacks).flat()
            );
            this.releaseAll.push(
                ...this.gpioModule.map(module => module.callbacks).flat()
            );
        }
    }

    initialize() {
        // init as not connected
        this.eventEmitter.emit('onBatteryAddonBoardIdUpdate', 0);
        return this.initializeFuelGauge();
    }

    private processModulePmic({ message }: LoggingEvent) {
        switch (message) {
            case 'No response from PMIC.':
                if (this.pmicState !== 'pmic-disconnected') {
                    this.pmicState = 'pmic-disconnected';
                    this.eventEmitter.emit('onPmicStateChange', this.pmicState);
                }
                break;
            case 'PMIC available. Application can be restarted.':
                if (this.pmicState === 'pmic-pending-rebooting') return;

                if (this.autoReboot) {
                    this.kernelReset();
                    this.pmicState = 'pmic-pending-rebooting';
                    this.eventEmitter.emit('onPmicStateChange', this.pmicState);
                } else if (this.pmicState !== 'pmic-pending-reboot') {
                    this.pmicState = 'pmic-pending-reboot';
                    this.eventEmitter.emit('onPmicStateChange', this.pmicState);
                }
                break;
        }
    }

    private handleReset(logLevel: string, message: string) {
        if (
            logLevel === 'err' &&
            message.startsWith('Error: ADC reading failed')
        ) {
            if (this.waitingForReset) return;

            this.waitingForReset = true;
        } else if (logLevel === 'inf' && this.waitingForReset) {
            if (this.recentReset) {
                this.dialogHandler?.({
                    uuid: 'bootMonitorEnabled',
                    type: 'information',
                    title: 'Boot monitor is enabled',
                    message:
                        'The boot monitor on TIMER is enabled and will cause a periodic reset. Do you want to disable it?',
                    confirmLabel: 'Yes, disable it',
                    onConfirm: () =>
                        this.timerConfigModule?.set.enabled?.(false),
                    cancelLabel: 'No, keep enabled',
                });
            }
            this.waitingForReset = false;
            this.recentReset = true;
            setTimeout(() => {
                this.recentReset = false;
            }, 15000);
            this.requestUpdate();
        }
    }

    private processModulePmicAdc({
        timestamp,
        message,
        logLevel,
    }: LoggingEvent) {
        this.handleReset(logLevel, message);

        if (logLevel !== 'inf') return;

        const messageParts = message.split(',');
        const adcSample: AdcSample = {
            timestamp,
            vBat: 0,
            soc: NaN,
            tDie: 0,
        };

        const fixed = (dp: number, value?: string | number) =>
            Number(Number(value ?? 0).toFixed(dp));

        messageParts.forEach(part => {
            const pair = part.split('=');
            switch (pair[0]) {
                case 'vbat':
                    adcSample.vBat = fixed(2, pair[1]);
                    break;
                case 'tdie':
                    adcSample.tDie = fixed(1, pair[1]);
                    break;
                case 'soc':
                    adcSample.soc = Math.min(
                        100,
                        Math.max(0, fixed(1, pair[1]))
                    );
                    break;
            }
        });

        if (adcSample.timestamp < this.lastUptime) {
            this.uptimeOverflowCounter += 1;
            adcSample.timestamp += MAX_TIMESTAMP * this.uptimeOverflowCounter;
        }

        this.lastUptime = adcSample.timestamp;

        this.eventEmitter.emit('onAdcSample', adcSample);
    }

    private processModulePmicIrq({ message }: LoggingEvent) {
        // Handle timer expiry interrupt and emit event
        if (message === 'SYS_TIMER_EXPIRY') {
            this.eventEmitter.emit('onTimerExpiryInterrupt', message);
            return;
        }
        const messageParts = message.split(',');
        const event: IrqEvent = {
            type: '',
            event: '',
        };
        messageParts.forEach(part => {
            const pair = part.split('=');
            switch (pair[0]) {
                case 'type':
                    event.type = pair[1];
                    break;
                case 'bit':
                    event.event = pair[1];
                    break;
            }

            // handle event!!
        });
    }

    private processBattInputDetect({ message }: LoggingEvent) {
        // Example: module_batt_input_detect: Battery board id: 0

        const boardIdPattern = /Battery board id: ([0-9]+)/;

        const match = boardIdPattern.exec(message);

        if (match && match.length === 2) {
            const holderId = parseInt(match[1], 10);
            console.log(holderId);
            this.eventEmitter.emit('onBatteryAddonBoardIdUpdate', holderId);
        }
    }

    private initializeFuelGauge() {
        if (this.offlineMode) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            this.startAdcSample(1000, 500)
                .then(async () => {
                    try {
                        await this.boostModule[0].set.modeControl('HP');
                        const listenerADtor = this.onAdcSample(async () => {
                            listenerADtor();
                            try {
                                await this._fuelGaugeModule?.actions.reset();
                                const listenerBDtor = this.onAdcSample(() => {
                                    listenerBDtor();
                                    this.boostModule[0].set
                                        .modeControl('AUTO')
                                        .catch(reject);
                                    this.startAdcSample(2000, 500);
                                    resolve();
                                });
                            } catch (e) {
                                reject(e);
                            }
                        });
                    } catch (e) {
                        reject(e);
                    }
                })
                .catch(reject);
        });
    }

    release() {
        super.release();
        this.releaseAll.forEach(release => release());
    }

    // eslint-disable-next-line class-methods-use-this
    generateExport(
        getState: () => RootState & {
            app: { pmicControl: { npmDevice: BaseNpmDevice } };
        }
    ) {
        const currentState = getState().app.pmicControl;

        return {
            boosts: [...currentState.boosts],
            ldos: [...currentState.ldos.map(toLdoExport)],
            gpios: [...currentState.gpios],
            leds: [...currentState.leds],
            lowPower: currentState.lowPower,
            reset: currentState.reset,
            timerConfig: currentState.timerConfig,
            fuelGaugeSettings: {
                enabled: currentState.fuelGaugeSettings.enabled,
                chargingSamplingRate:
                    currentState.fuelGaugeSettings.chargingSamplingRate,
            },
            firmwareVersion: currentState.npmDevice.supportedVersion,
            deviceType: currentState.npmDevice.deviceType,
            usbPower: currentState.usbPower
                ? { currentLimiter: currentState.usbPower.currentLimiter }
                : undefined,
            fileFormatVersion: 2 as const,
        } as NpmExportLatest;
    }
}
