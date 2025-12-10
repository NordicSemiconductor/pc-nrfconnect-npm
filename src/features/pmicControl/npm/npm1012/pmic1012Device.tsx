/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
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
import ChargerModule from './charger';

export const npm1012FWVersion = '0.7.2+0';

export default class Npm1012 extends BaseNpmDevice {
    private waitingForReset = false;
    private recentReset = false;
    constructor(
        shellParser: ShellParser | undefined,
        dialogHandler: ((pmicDialog: PmicDialog) => void) | null,
    ) {
        super(
            'npm1012',
            npm1012FWVersion,
            shellParser,
            dialogHandler,
            new NpmEventEmitter(),
            {
                ChargerModule,
                maxEnergyExtraction: true,
                noOfLEDs: 0,
                noOfBatterySlots: 3,
            },
            0,
            {
                reset: false,
                charger: true,
                sensor: false,
            },
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
                }),
            );
        }
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
                        message.split('=')[1],
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
                        Math.max(0, fixed(1, pair[1])),
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

    release() {
        super.release();
        this.releaseAll.forEach(release => release());
    }

    // eslint-disable-next-line class-methods-use-this
    generateExport(
        getState: () => RootState & {
            app: { pmicControl: { npmDevice: BaseNpmDevice } };
        },
    ) {
        const currentState = getState().app.pmicControl;

        return {
            boosts: [...currentState.boosts],
            charger: currentState.charger,
            ldos: [...currentState.ldos],
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

    // eslint-disable-next-line class-methods-use-this
    get canUploadBatteryProfiles() {
        return false;
    }

    // TODO: Enable when overlay format is known
    // generateOverlay(npmExport: NpmExportV2) {
    //     return overlay(npmExport, this);
    // }
}
