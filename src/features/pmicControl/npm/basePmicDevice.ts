/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';

import { MAX_TIMESTAMP, parseToNumber, toRegex } from './pmicHelpers';
import {
    AdcSample,
    AdcSampleSettings,
    BatteryModel,
    Buck,
    Charger,
    ErrorLogs,
    GPIO,
    IBaseNpmDevice,
    Ldo,
    LED,
    LoggingEvent,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    POF,
    ShipModeConfig,
    TimerConfig,
    USBPower,
} from './types';

export const baseNpmDevice: IBaseNpmDevice = (
    shellParser: ShellParser | undefined,
    _dialogHandler: ((pmicDialog: PmicDialog) => void) | null,
    eventEmitter: EventEmitter,
    devices: {
        charger?: boolean;
        noOfBucks?: number;
        noOfLdos?: number;
        noOfGPIOs?: number;
        noOfLEDs?: number;
    },
    supportsVersion: string
) => {
    let rebooting = false;
    let deviceUptimeToSystemDelta = 0;
    let uptimeOverflowCounter = 0;

    const getKernelUptime = () =>
        new Promise<number>((resolve, reject) => {
            shellParser?.enqueueRequest(
                'kernel uptime',
                {
                    onSuccess: res => {
                        resolve(parseToNumber(res));
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });

    const kernelReset = () => {
        if (rebooting || !shellParser) return;
        rebooting = true;

        eventEmitter.emit('onBeforeReboot', 100);
        shellParser.unPause();
        shellParser.enqueueRequest(
            'delayed_reboot 100',
            {
                onSuccess: () => {},
                onError: () => {
                    rebooting = false;
                },
                onTimeout: error => {
                    rebooting = false;
                    console.warn(error);
                },
            },
            undefined,
            true
        );
    };

    const updateUptimeOverflowCounter = () => {
        getKernelUptime().then(milliseconds => {
            deviceUptimeToSystemDelta = Date.now() - milliseconds;
            uptimeOverflowCounter = Math.floor(milliseconds / MAX_TIMESTAMP);
        });
    };

    const releaseAll: (() => void)[] = [];

    if (shellParser) {
        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('(delayed_reboot [0-1]+)|(kernel reboot (cold|warm))'),
                () => {
                    rebooting = true;
                    eventEmitter.emit('onReboot', true);
                },
                error => {
                    rebooting = false;
                    eventEmitter.emit('onReboot', false, error);
                }
            )
        );

        releaseAll.push(
            shellParser.onAnyCommandResponse(({ command, response, error }) => {
                const event: LoggingEvent = {
                    timestamp: Date.now() - deviceUptimeToSystemDelta,
                    module: 'shell_commands',
                    logLevel: error ? 'err' : 'inf',
                    message: `command: "${command}" response: "${response}"`,
                };

                eventEmitter.emit('onLoggingEvent', {
                    loggingEvent: event,
                    dataPair: false,
                });

                if (error) {
                    logger.error(response.replaceAll(/(\r\n|\r|\n)/g, ' '));
                }
            })
        );

        releaseAll.push(
            shellParser.onUnknownCommand(command => {
                const event: LoggingEvent = {
                    timestamp: Date.now() - deviceUptimeToSystemDelta,
                    module: 'shell_commands',
                    logLevel: 'wrn',
                    message: `unknown command: "${command}"`,
                };

                eventEmitter.emit('onLoggingEvent', {
                    loggingEvent: event,
                    dataPair: false,
                });
            })
        );
    }

    updateUptimeOverflowCounter();

    return {
        kernelReset,
        getKernelUptime,
        onPmicStateChange: (handler: (state: PmicState) => void) => {
            eventEmitter.on('onPmicStateChange', handler);
            return () => {
                eventEmitter.removeListener('onPmicStateChange', handler);
            };
        },
        onAdcSample: (handler: (adcSample: AdcSample) => void) => {
            eventEmitter.on('onAdcSample', handler);
            return () => {
                eventEmitter.removeListener('onAdcSample', handler);
            };
        },
        onAdcSettingsChange: (
            handler: (adcSample: AdcSampleSettings) => void
        ) => {
            eventEmitter.on('onAdcSettingsChange', handler);
            return () => {
                eventEmitter.removeListener('onAdcSettingsChange', handler);
            };
        },
        onChargingStatusUpdate: (
            handler: (payload: PmicChargingState, error?: string) => void
        ) => {
            eventEmitter.on('onChargingStatusUpdate', handler);
            return () => {
                eventEmitter.removeListener('onChargingStatusUpdate', handler);
            };
        },
        onChargerUpdate: (
            handler: (payload: Partial<Charger>, error?: string) => void
        ) => {
            eventEmitter.on('onChargerUpdate', handler);
            return () => {
                eventEmitter.removeListener('onChargerUpdate', handler);
            };
        },
        onBuckUpdate: (
            handler: (payload: PartialUpdate<Buck>, error?: string) => void
        ) => {
            eventEmitter.on('onBuckUpdate', handler);
            return () => {
                eventEmitter.removeListener('onBuckUpdate', handler);
            };
        },

        onFuelGaugeUpdate: (handler: (payload: boolean) => void) => {
            eventEmitter.on('onFuelGauge', handler);
            return () => {
                eventEmitter.removeListener('onFuelGauge', handler);
            };
        },

        onLdoUpdate: (
            handler: (payload: PartialUpdate<Ldo>, error?: string) => void
        ) => {
            eventEmitter.on('onLdoUpdate', handler);
            return () => {
                eventEmitter.removeListener('onLdoUpdate', handler);
            };
        },

        onGPIOUpdate: (
            handler: (payload: PartialUpdate<GPIO>, error?: string) => void
        ) => {
            eventEmitter.on('onGPIOUpdate', handler);
            return () => {
                eventEmitter.removeListener('onGPIOUpdate', handler);
            };
        },

        onLEDUpdate: (
            handler: (payload: PartialUpdate<LED>, error?: string) => void
        ) => {
            eventEmitter.on('onLEDUpdate', handler);
            return () => {
                eventEmitter.removeListener('onLEDUpdate', handler);
            };
        },
        onPOFUpdate: (
            handler: (payload: Partial<POF>, error?: string) => void
        ) => {
            eventEmitter.on('onPOFUpdate', handler);
            return () => {
                eventEmitter.removeListener('onPOFUpdate', handler);
            };
        },
        onTimerConfigUpdate: (
            handler: (payload: Partial<TimerConfig>, error?: string) => void
        ) => {
            eventEmitter.on('onTimerConfigUpdate', handler);
            return () => {
                eventEmitter.removeListener('onTimerConfigUpdate', handler);
            };
        },

        onShipUpdate: (
            handler: (payload: Partial<ShipModeConfig>, error?: string) => void
        ) => {
            eventEmitter.on('onShipUpdate', handler);
            return () => {
                eventEmitter.removeListener('onShipUpdate', handler);
            };
        },

        onLoggingEvent: (
            handler: (payload: {
                loggingEvent: LoggingEvent;
                dataPair: boolean;
            }) => void
        ) => {
            eventEmitter.on('onLoggingEvent', handler);
            return () => {
                eventEmitter.removeListener('onLoggingEvent', handler);
            };
        },

        onActiveBatteryModelUpdate: (
            handler: (payload: BatteryModel) => void
        ) => {
            eventEmitter.on('onActiveBatteryModelUpdate', handler);
            return () => {
                eventEmitter.removeListener(
                    'onActiveBatteryModelUpdate',
                    handler
                );
            };
        },

        onStoredBatteryModelUpdate: (
            handler: (payload: (BatteryModel | null)[]) => void
        ) => {
            eventEmitter.on('onStoredBatteryModelUpdate', handler);
            return () => {
                eventEmitter.removeListener(
                    'onStoredBatteryModelUpdate',
                    handler
                );
            };
        },

        onBeforeReboot: (handler: (waitTimeout: number) => void) => {
            eventEmitter.on('onBeforeReboot', handler);
            return () => {
                eventEmitter.removeListener('onBeforeReboot', handler);
            };
        },

        onReboot: (handler: (success: boolean) => void) => {
            eventEmitter.on('onReboot', handler);
            return () => {
                eventEmitter.removeListener('onReboot', handler);
            };
        },

        onUsbPower: (handler: (payload: Partial<USBPower>) => void) => {
            eventEmitter.on('onUsbPower', handler);
            return () => {
                eventEmitter.removeListener('onUsbPower', handler);
            };
        },

        onErrorLogs: (
            handler: (payload: Partial<ErrorLogs>, error?: string) => void
        ) => {
            eventEmitter.on('onErrorLogs', handler);
            return () => {
                eventEmitter.removeListener('onErrorLogs', handler);
            };
        },

        hasCharger: () => devices.charger ?? false,
        getNumberOfBucks: () => devices.noOfBucks ?? 0,
        getNumberOfLdos: () => devices.noOfLdos ?? 0,
        getNumberOfGPIOs: () => devices.noOfGPIOs ?? 0,
        getNumberOfLEDs: () => devices.noOfLEDs ?? 0,

        isSupportedVersion: () =>
            new Promise<{ supported: boolean; version: string }>(
                (resolve, reject) => {
                    shellParser?.enqueueRequest(
                        'app_version',
                        {
                            onSuccess: result => {
                                result = result.replace('app_version=', '');
                                resolve({
                                    supported: supportsVersion === result,
                                    version: result,
                                });
                            },
                            onError: reject,
                            onTimeout: error => {
                                reject(error);
                                console.warn(error);
                            },
                        },
                        undefined,
                        true
                    );
                }
            ),
        getSupportedVersion: () => supportsVersion,

        getPmicVersion: () =>
            new Promise<number>((resolve, reject) => {
                shellParser?.enqueueRequest(
                    'pmic_revision',
                    {
                        onSuccess: result => {
                            result = result.replace('pmic_revision=', '');
                            resolve(Number.parseFloat(result));
                        },
                        onError: reject,
                        onTimeout: error => {
                            reject(error);
                            console.warn(error);
                        },
                    },
                    undefined,
                    true
                );
            }),
        isPMICPowered: () =>
            new Promise<boolean>((resolve, reject) => {
                shellParser?.enqueueRequest(
                    'npm_pmic_ping check',
                    {
                        onSuccess: result => {
                            resolve(result === 'Pinging PMIC succeeded');
                        },
                        onError: reject,
                        onTimeout: error => {
                            reject(error);
                            console.warn(error);
                        },
                    },
                    undefined,
                    true
                );
            }),
        getUptimeOverflowCounter: () => uptimeOverflowCounter,
        setUptimeOverflowCounter: (value: number) => {
            uptimeOverflowCounter = value;
        },
        release: () => {
            releaseAll.forEach(release => release());
        },
    };
};
