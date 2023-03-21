/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { parseToNumber, toRegex } from './pmicHelpers';
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
    PmicState,
    PmicWarningDialog,
    RebootMode,
} from './types';

export const baseNpmDevice: IBaseNpmDevice = (
    shellParser: ShellParser | undefined,
    _warningDialogHandler: (pmicWarningDialog: PmicWarningDialog) => void,
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

    const kernelReset = (mode: 'cold' | 'warm', callback?: () => void) => {
        if (rebooting || !shellParser) return;
        rebooting = true;
        setTimeout(() => {
            rebooting = false;
        }, 1000);

        eventEmitter.emit('onBeforeReboot', mode);
        shellParser.enqueueRequest(
            `kernel reboot ${mode}`,
            () => {
                if (callback) callback();
                rebooting = false;
            },
            () => {
                if (callback) callback();
                rebooting = false;
            }
        );
    };

    shellParser?.registerCommandCallback(
        toRegex('kernel reboot (cold|warm)'),
        () => eventEmitter.emit('onReboot', true),
        error => eventEmitter.emit('onReboot', false, error)
    );

    return {
        kernelReset,
        kernelUptime(callback) {
            shellParser?.enqueueRequest('kernel uptime', res => {
                callback(parseToNumber(res));
            });
        },
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

        onBeforeReboot: (handler: (mode: RebootMode) => void) => {
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
                    reject
                );
            }),
        getSupportedVersion: () => supportsVersion,
    };
};
