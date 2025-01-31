/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../utils/helpers';
import { baseNpmDevice } from '../basePmicDevice';
import {
    isModuleDataPair,
    MAX_TIMESTAMP,
    noop,
    NpmEventEmitter,
    parseBatteryModel,
    parseColonBasedAnswer,
    parseLogData,
    parseToNumber,
    toRegex,
} from '../pmicHelpers';
import {
    AdcSample,
    AdcSampleSettings,
    BatteryModel,
    INpmDevice,
    IrqEvent,
    LED,
    LEDMode,
    LEDModeValues,
    LoggingEvent,
    PmicDialog,
    PmicState,
    ProfileDownload,
} from '../types';
import getBatteryModule from './battery';
import getBoostModule, { numberOfBoosts } from './boost';
import { FuelGaugeModule } from './fuelGauge';
import setupGpio from './gpio';
import setupLdo, { numberOfLdos } from './ldo';
import setupLowPower from './lowPower';
import setupReset from './reset';
import setupTimer from './timerConfig';

export const npm2100FWVersion = '0.4.1+0';
export const minimumHWVersion = '0.8.0'; // TODO test with new kits once we have one!!

export const getNPM2100: INpmDevice = (shellParser, dialogHandler) => {
    const eventEmitter = new NpmEventEmitter();

    const devices = {
        noOfBoosts: numberOfBoosts,
        noOfBucks: 0,
        maxEnergyExtraction: true,
        noOfLdos: numberOfLdos,
        noOfLEDs: 0,
        noOfBatterySlots: 1,
    };
    const baseDevice = baseNpmDevice(
        shellParser,
        dialogHandler,
        eventEmitter,
        devices,
        npm2100FWVersion
    );
    let lastUptime = 0;
    let autoReboot = true;

    let pmicState: PmicState = shellParser
        ? 'pmic-connected'
        : 'ek-disconnected';

    // init as not connected
    eventEmitter.emit('onBatteryAddonBoardIdUpdate', 0);

    const processModulePmic = ({ message }: LoggingEvent) => {
        switch (message) {
            case 'No response from PMIC.':
                if (pmicState !== 'pmic-disconnected') {
                    pmicState = 'pmic-disconnected';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                }
                break;
            case 'PMIC available. Application can be restarted.':
                if (pmicState === 'pmic-pending-rebooting') return;

                if (autoReboot) {
                    baseDevice.kernelReset();
                    pmicState = 'pmic-pending-rebooting';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                } else if (pmicState !== 'pmic-pending-reboot') {
                    pmicState = 'pmic-pending-reboot';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                }
                break;
        }
    };

    const processModulePmicAdc = ({
        timestamp,
        message,
        logLevel,
    }: LoggingEvent) => {
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

        if (adcSample.timestamp < lastUptime) {
            baseDevice.setUptimeOverflowCounter(
                baseDevice.getUptimeOverflowCounter() + 1
            );
            adcSample.timestamp +=
                MAX_TIMESTAMP * baseDevice.getUptimeOverflowCounter();
        }

        lastUptime = adcSample.timestamp;

        eventEmitter.emit('onAdcSample', adcSample);
    };

    const processModulePmicIrq = ({ message }: LoggingEvent) => {
        // Handle timer expiry interrupt and emit event
        if (message === 'SYS_TIMER_EXPIRY') {
            eventEmitter.emit('onTimerExpiryInterrupt', message);
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
    };

    const processBattInputDetect = ({ message }: LoggingEvent) => {
        // Example: module_batt_input_detect: Battery board id: 0

        const boardIdPattern = /Battery board id: ([0-9]+)/;

        const match = boardIdPattern.exec(message);

        if (match && match.length === 2) {
            const holderId = parseInt(match[1], 10);
            console.log(holderId);
            eventEmitter.emit('onBatteryAddonBoardIdUpdate', holderId);
        }
    };

    const startAdcSample = (intervalMs: number, samplingRate: number) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `npm_adc sample ${samplingRate} ${intervalMs}`,
                () => resolve(),
                () => reject()
            );
        });

    const stopAdcSample = () => {
        sendCommand(`npm_adc sample 0`);
    };

    const sendCommand = (
        command: string,
        onSuccess: (response: string, command: string) => void = noop,
        onError: (response: string, command: string) => void = noop,
        unique = true
    ) => {
        if (pmicState !== 'ek-disconnected') {
            shellParser?.enqueueRequest(
                command,
                {
                    onSuccess,
                    onError: (error, cmd) => {
                        if (
                            error.includes('IO error') &&
                            pmicState === 'pmic-connected'
                        ) {
                            pmicState = 'pmic-disconnected';
                            eventEmitter.emit('onPmicStateChange', pmicState);
                        }
                        onError(error, cmd);
                    },
                    onTimeout: error => {
                        if (onError) onError(error, command);
                        console.warn(error);
                    },
                },
                undefined,
                unique
            );
        } else {
            onError('No Shell connection', command);
        }
    };

    const initializeFuelGauge = () => {
        if (offlineMode) return Promise.resolve();
        return new Promise<void>((resolve, reject) => {
            startAdcSample(1000, 500)
                .then(async () => {
                    try {
                        await boostModule[0].set.modeControl('HP');
                        const listenerADtor = baseDevice.onAdcSample(
                            async () => {
                                listenerADtor();
                                try {
                                    await fuelGaugeModule.actions.reset();
                                    const listenerBDtor =
                                        baseDevice.onAdcSample(() => {
                                            listenerBDtor();
                                            boostModule[0].set
                                                .modeControl('AUTO')
                                                .catch(reject);
                                            startAdcSample(2000, 500);
                                            resolve();
                                        });
                                } catch (e) {
                                    reject(e);
                                }
                            }
                        );
                    } catch (e) {
                        reject(e);
                    }
                })
                .catch(reject);
        });
    };

    const offlineMode = !shellParser;

    const ldoModule = setupLdo(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const gpioModule = setupGpio(
        shellParser,
        eventEmitter,
        sendCommand,
        dialogHandler,
        offlineMode
    );

    const fuelGaugeModule = new FuelGaugeModule(
        shellParser,
        eventEmitter,
        sendCommand,
        dialogHandler,
        offlineMode,
        initializeFuelGauge
    );

    const batteryModule = getBatteryModule(
        shellParser,
        eventEmitter,
        sendCommand
    );

    const boostModule = getBoostModule(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    // Setup lowpower
    const lowPowerModule = setupLowPower(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    // Setup reset
    const resetModule = setupReset(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const timerConfigModule = setupTimer(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const releaseAll: (() => void)[] = [];

    if (shellParser) {
        releaseAll.push(
            shellParser.onShellLoggingEvent(logEvent => {
                parseLogData(logEvent, loggingEvent => {
                    switch (loggingEvent.module) {
                        case 'module_pmic':
                            processModulePmic(loggingEvent);
                            break;
                        case 'module_pmic_adc':
                            processModulePmicAdc(loggingEvent);
                            break;
                        case 'module_pmic_irq':
                            processModulePmicIrq(loggingEvent);
                            break;
                        case 'module_batt_input_detect':
                            processBattInputDetect(loggingEvent);
                            break;
                        case 'module_pmic_charger':
                            // Handled in charger callbacks
                            break;
                        case 'module_fg':
                            // Handled in fuelGauge callbacks
                            break;
                    }

                    eventEmitter.emit('onLoggingEvent', {
                        loggingEvent,
                        dataPair: isModuleDataPair(loggingEvent.module),
                    });
                });
            })
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npm_adc sample', false, undefined, '[0-9]+ [0-9]+'),
                res => {
                    const results = parseColonBasedAnswer(res).split(',');
                    const settings: AdcSampleSettings = {
                        samplingRate: 1000,
                        reportRate: 2000,
                    };
                    results.forEach(result => {
                        const pair = result.trim().split('=');
                        if (pair.length === 2) {
                            switch (pair[0]) {
                                case 'sample interval':
                                    settings.samplingRate = Number.parseInt(
                                        pair[1],
                                        10
                                    );
                                    break;
                                case 'report interval':
                                    settings.reportRate = Number.parseInt(
                                        pair[1],
                                        10
                                    );
                                    break;
                            }
                        }
                    });
                    eventEmitter.emit('onAdcSettingsChange', settings);
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('delayed_reboot', false, undefined, '[0-9]+'),
                () => {
                    pmicState = 'pmic-pending-rebooting';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                },
                noop
            )
        );

        releaseAll.push(...fuelGaugeModule.callbacks);
        releaseAll.push(...batteryModule.callbacks);
        releaseAll.push(...timerConfigModule.callbacks);
        releaseAll.push(...resetModule.callbacks);
        releaseAll.push(...boostModule.map(boost => boost.callbacks).flat());
        releaseAll.push(...ldoModule.map(ldo => ldo.callbacks).flat());
        releaseAll.push(...gpioModule.map(module => module.callbacks).flat());

        for (let i = 0; i < devices.noOfLEDs; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx led mode', true, i, '[0-3]'),
                    res => {
                        const mode = LEDModeValues[parseToNumber(res)];
                        if (mode) {
                            eventEmitter.emitPartialEvent<LED>(
                                'onLEDUpdate',
                                {
                                    mode,
                                },
                                i
                            );
                        }
                    },
                    noop
                )
            );
        }
    }

    const setLedMode = (index: number, mode: LEDMode) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                eventEmitter.emitPartialEvent<LED>(
                    'onLEDUpdate',
                    {
                        mode,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx led mode set ${index} ${LEDModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.ledMode(index);
                        reject();
                    }
                );
            }
        });

    // Return a set of default LED settings
    const ledDefaults = (noOfLeds: number): LED[] => {
        const defaultLEDs: LED[] = [];
        for (let i = 0; i < noOfLeds; i += 1) {
            defaultLEDs.push({
                mode: LEDModeValues[i],
            });
        }
        return defaultLEDs;
    };

    const requestUpdate = {
        all: () => {
            // Request all updates for nPM2100

            batteryModule.get.all();
            timerConfigModule.get.all();
            resetModule.get.all();
            lowPowerModule.get.all();
            boostModule.forEach(boost => boost.get.all());
            ldoModule.forEach(ldo => ldo.get.all());
            gpioModule.forEach(module => module.get.all());

            for (let i = 0; i < devices.noOfLEDs; i += 1) {
                requestUpdate.ledMode(i);
            }

            fuelGaugeModule.get.all();
        },

        ledMode: (index: number) => sendCommand(`npmx led mode get ${index}`),
    };

    return {
        ...baseDevice,
        initialize: async () => {
            await initializeFuelGauge();
        },
        release: () => {
            baseDevice.release();
            releaseAll.forEach(release => release());
        },
        applyConfig: config =>
            new Promise<void>(resolve => {
                if (config.deviceType !== 'npm2100') {
                    resolve();
                    return;
                }

                const action = async () => {
                    try {
                        await Promise.all(
                            config.boosts.map((boost, index) =>
                                (async () => {
                                    await boostModule[index].set.all(boost);
                                })()
                            )
                        );
                        await Promise.all(
                            config.ldos.map((ldo, index) =>
                                (async () => {
                                    await ldoModule[index].set.all(ldo);
                                })()
                            )
                        );

                        await Promise.all(
                            config.gpios.map((gpio, index) =>
                                (async () => {
                                    await gpioModule[index].set.all(gpio);
                                })()
                            )
                        );

                        await Promise.all(
                            config.leds.map((led, index) =>
                                (async () => {
                                    await setLedMode(index, led.mode);
                                })()
                            )
                        );

                        if (config.timerConfig)
                            await timerConfigModule.set.all(config.timerConfig);

                        if (config.reset)
                            await resetModule.set.all(config.reset);

                        if (config.lowPower)
                            await lowPowerModule.set.all(config.lowPower);

                        await fuelGaugeModule.set.enabled(
                            config.fuelGaugeSettings.enabled
                        );
                    } catch (error) {
                        // TODO
                        // console.log(error);
                        // logger.error('Invalid File.');
                    }
                };

                if (config.firmwareVersion == null) {
                    logger.error('Invalid File.');
                    resolve();
                    return;
                }

                if (
                    dialogHandler &&
                    config.firmwareVersion !== baseDevice.getSupportedVersion()
                ) {
                    const warningDialog: PmicDialog = {
                        doNotAskAgainStoreID: 'pmic2100-load-config-mismatch',
                        message: `The configuration was intended for firmware version ${
                            config.firmwareVersion
                        }. Device is running a different version.
                    ${baseDevice.getSupportedVersion()}. Do you still want to apply this configuration?`,
                        confirmLabel: 'Yes',
                        optionalLabel: "Yes, don't ask again",
                        cancelLabel: 'No',
                        title: 'Warning',
                        onConfirm: async () => {
                            await action();
                            resolve();
                        },
                        onCancel: () => {
                            resolve();
                        },
                        onOptional: async () => {
                            await action();
                            resolve();
                        },
                    };

                    dialogHandler(warningDialog);
                } else {
                    action().finally(resolve);
                }
            }),

        getDeviceType: () => 'npm2100',
        getConnectionState: () => pmicState,
        startAdcSample,
        stopAdcSample,

        getUSBCurrentLimiterRange: () => [
            0.1,
            ...getRange([
                {
                    min: 0.5,
                    max: 1.5,
                    step: 0.1,
                },
            ]).map(v => Number(v.toFixed(2))),
        ],

        requestUpdate,

        setLedMode,

        getHardcodedBatteryModels: () =>
            new Promise<BatteryModel[]>((resolve, reject) => {
                shellParser?.enqueueRequest(
                    'fuel_gauge model list',
                    {
                        onSuccess: result => {
                            const models = result.split(':');

                            if (models.length < 3) reject();
                            const stringModels = models[2].trim().split('\n');
                            const list = stringModels.map(parseBatteryModel);
                            resolve(
                                list.filter(
                                    item => item !== null
                                ) as BatteryModel[]
                            );
                        },
                        onError: reject,
                        onTimeout: error => {
                            reject();
                            console.warn(error);
                        },
                    },
                    undefined,
                    true
                );
            }),

        onProfileDownloadUpdate: (
            handler: (payload: ProfileDownload, error?: string) => void
        ) => {
            eventEmitter.on('onProfileDownloadUpdate', handler);
            return () => {
                eventEmitter.removeListener('onProfileDownloadUpdate', handler);
            };
        },

        setAutoRebootDevice: v => {
            if (v && v !== autoReboot && pmicState === 'pmic-pending-reboot') {
                baseDevice.kernelReset();
                pmicState = 'pmic-pending-rebooting';
                eventEmitter.emit('onPmicStateChange', pmicState);
            }
            autoReboot = v;
        },

        // Default settings
        ledDefaults: () => ledDefaults(devices.noOfLEDs),

        fuelGaugeModule,
        boostModule,
        gpioModule,
        ldoModule,
        timerConfigModule,
        resetModule,
        lowPowerModule,

        getBatteryConnectedVoltageThreshold: () => 0, // 0V
    };
};
