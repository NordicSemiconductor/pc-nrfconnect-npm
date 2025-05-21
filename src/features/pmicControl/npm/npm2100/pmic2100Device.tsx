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
    NpmExportV2,
    PmicDialog,
} from '../types';
import BatteryModule, { PowerID2100 } from './battery';
import BoostModule from './boost';
import FuelGaugeModule from './fuelGauge';
import GpioModule from './gpio';
import LdoModule, { toLdoExport } from './ldo';
import LowPowerModule from './lowPower';
import overlay from './overlay';
import ResetModule from './reset';
import TimerConfigModule from './timerConfig';

export const npm2100FWVersion = '0.7.1+0';
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
                ldos: {
                    count: 1,
                    Module: LdoModule,
                },
                maxEnergyExtraction: true,
                noOfLEDs: 0,
                noOfBatterySlots: 1,
                gpios: {
                    Module: GpioModule,
                    count: 2,
                },
                boosts: {
                    Module: BoostModule,
                    count: 1,
                },
                TimerConfigModule,
                BatteryModule,
                LowPowerModule,
                ResetModule,
                FuelGaugeModule,
            },
            0,
            {
                reset: false,
                charger: false,
                sensor: false,
            }
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
            default:
                if (message.startsWith('powerid=')) {
                    this.eventEmitter.emit(
                        'onPowerIdUpdate',
                        message.split('=')[1] as PowerID2100
                    );
                }
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

    initializeFuelGauge() {
        if (this.offlineMode) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            this.startAdcSample(1000, 500)
                .then(async () => {
                    try {
                        await this.boostModule[0].set.modeControl('HP');
                        const listenerADtor = this.onAdcSample(async () => {
                            listenerADtor();
                            try {
                                await this.fuelGaugeModule?.actions.reset();
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
                discardPosiiveDeltaZ:
                    currentState.fuelGaugeSettings.discardPosiiveDeltaZ,
            },
            firmwareVersion: currentState.npmDevice.supportedVersion,
            deviceType: currentState.npmDevice.deviceType,
            usbPower: currentState.usbPower
                ? { currentLimiter: currentState.usbPower.currentLimiter }
                : undefined,
            fileFormatVersion: 2 as const,
        } as NpmExportLatest;
    }

    generateOverlay(npmExport: NpmExportV2) {
        return overlay(npmExport, this);
    }
}
