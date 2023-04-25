/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { MAX_TIMESTAMP, parseToNumber, toRegex } from './pmicHelpers';
import {
    AdcSample,
    BatteryModel,
    Buck,
    Charger,
    IBaseNpmDevice,
    Ldo,
    LoggingEvent,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
} from './types';

export const baseNpmDevice: IBaseNpmDevice = (
    shellParser: ShellParser | undefined,
    _dialogHandler: (pmicDialog: PmicDialog) => void,
    eventEmitter: EventEmitter,
    devices: {
        noOfChargers?: number;
        noOfBucks?: number;
        noOfLdos?: number;
        noOfGPIOs?: number;
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
                res => {
                    resolve(parseToNumber(res));
                },
                reject,
                console.warn,
                true
            );
        });

    const kernelReset = () => {
        if (rebooting || !shellParser) return;
        rebooting = true;

        eventEmitter.emit('onBeforeReboot', 100);
        shellParser.enqueueRequest(
            'delayed_reboot 100',
            () => {},
            () => {
                rebooting = false;
            },
            console.warn,
            true
        );
    };

    const updateUptimeOverflowCounter = () => {
        getKernelUptime().then(milliseconds => {
            deviceUptimeToSystemDelta = Date.now() - milliseconds;
            uptimeOverflowCounter = Math.floor(milliseconds / MAX_TIMESTAMP);
        });
    };

    shellParser?.registerCommandCallback(
        toRegex('(delayed_reboot [0-1]+)|(kernel reboot (cold|warm))'),
        () => {
            rebooting = true;
            eventEmitter.emit('onReboot', true);
        },
        error => {
            rebooting = false;
            eventEmitter.emit('onReboot', false, error);
        }
    );

    shellParser?.onAnyCommandResponse(({ command, response, error }) => {
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
    });

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
        onChargingStatusUpdate: (
            handler: (payload: PmicChargingState, error?: string) => void
        ) => {
            eventEmitter.on('onChargingStatusUpdate', handler);
            return () => {
                eventEmitter.removeListener('onChargingStatusUpdate', handler);
            };
        },
        onChargerUpdate: (
            handler: (payload: PartialUpdate<Charger>, error?: string) => void
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
            handler: (payload: BatteryModel | undefined) => void
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

        onUsbPowered: (handler: (success: boolean) => void) => {
            eventEmitter.on('onUsbPowered', handler);
            return () => {
                eventEmitter.removeListener('onUsbPowered', handler);
            };
        },

        getNumberOfChargers: () => devices.noOfChargers ?? 0,
        getNumberOfBucks: () => devices.noOfBucks ?? 0,
        getNumberOfLdos: () => devices.noOfLdos ?? 0,
        getNumberOfGPIOs: () => devices.noOfGPIOs ?? 0,

        isSupportedVersion: () =>
            new Promise<boolean>((resolve, reject) => {
                shellParser?.enqueueRequest(
                    'app_version',
                    result => {
                        resolve(`app_version=${supportsVersion}` === result);
                    },
                    reject,
                    console.warn,
                    true
                );
            }),
        getSupportedVersion: () => supportsVersion,

        getUptimeOverflowCounter: () => uptimeOverflowCounter,
        setUptimeOverflowCounter: (value: number) => {
            uptimeOverflowCounter = value;
        },
    };
};
