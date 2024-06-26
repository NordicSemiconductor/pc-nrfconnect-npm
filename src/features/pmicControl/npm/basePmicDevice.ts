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
    Boost,
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
        maxEnergyExtraction?: boolean;
        noOfBoosts?: number;
        noOfBucks?: number;
        noOfLdos?: number;
        noOfLEDs?: number;
        noOfBatterySlots?: number;
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

    const setupHandler =
        <T, WithError extends boolean = false>(name: string) =>
        (
            handler: WithError extends true
                ? (payload: T, error: string) => void
                : (payload: T) => void
        ) => {
            eventEmitter.on(name, handler);
            return () => {
                eventEmitter.removeListener(name, handler);
            };
        };
    return {
        kernelReset,
        getKernelUptime,
        onPmicStateChange: setupHandler<PmicState>('onPmicStateChange'),
        onAdcSample: setupHandler<AdcSample>('onAdcSample'),
        onAdcSettingsChange: setupHandler<AdcSampleSettings>(
            'onAdcSettingsChange'
        ),
        onChargingStatusUpdate: setupHandler<PmicChargingState, true>(
            'onChargingStatusUpdate'
        ),
        onChargerUpdate: setupHandler<Partial<Charger>, true>(
            'onChargerUpdate'
        ),
        onBoostUpdate: setupHandler<PartialUpdate<Boost>, true>(
            'onBoostUpdate'
        ),
        onBuckUpdate: setupHandler<PartialUpdate<Buck>, true>('onBuckUpdate'),
        onFuelGaugeUpdate: setupHandler<boolean>('onFuelGauge'),
        onLdoUpdate: setupHandler<PartialUpdate<Ldo>, true>('onLdoUpdate'),
        onGPIOUpdate: setupHandler<PartialUpdate<GPIO>, true>('onGPIOUpdate'),
        onLEDUpdate: setupHandler<PartialUpdate<LED>, true>('onLEDUpdate'),
        onPOFUpdate: setupHandler<Partial<POF>, true>('onPOFUpdate'),
        onTimerConfigUpdate: setupHandler<Partial<TimerConfig>, true>(
            'onTimerConfigUpdate'
        ),
        onShipUpdate: setupHandler<Partial<ShipModeConfig>, true>(
            'onShipUpdate'
        ),
        onLoggingEvent: setupHandler<{
            loggingEvent: LoggingEvent;
            dataPair: boolean;
        }>('onLoggingEvent'),
        onActiveBatteryModelUpdate: setupHandler<BatteryModel>(
            'onActiveBatteryModelUpdate'
        ),
        onStoredBatteryModelUpdate: setupHandler<BatteryModel[]>(
            'onStoredBatteryModelUpdate'
        ),
        onBeforeReboot: setupHandler<number>('onBeforeReboot'),
        onReboot: setupHandler<boolean>('onReboot'),
        onUsbPower: setupHandler<Partial<USBPower>>('onUsbPower'),
        onErrorLogs: setupHandler<Partial<ErrorLogs>, true>('onErrorLogs'),
        clearErrorLogs: (errorOnly?: boolean) => {
            if (errorOnly)
                eventEmitter.emit('onErrorLogs', {
                    chargerError: [],
                    sensorError: [],
                });
            else
                eventEmitter.emit('onErrorLogs', {
                    resetCause: [],
                    chargerError: [],
                    sensorError: [],
                });
        },

        hasCharger: () => !!devices.charger,
        hasMaxEnergyExtraction: () => !!devices.maxEnergyExtraction,
        getNumberOfBoosts: () => devices.noOfBoosts ?? 0,
        getNumberOfBucks: () => devices.noOfBucks ?? 0,
        getNumberOfLdos: () => devices.noOfLdos ?? 0,
        getNumberOfLEDs: () => devices.noOfLEDs ?? 0,
        getNumberOfBatteryModelSlots: () => devices.noOfBatterySlots ?? 0,

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

        boostModule: [],
        gpioModule: [],
        buckModule: [],

        supportedErrorLogs: {
            reset: false,
            charger: false,
            sensor: false,
        },
    };
};
