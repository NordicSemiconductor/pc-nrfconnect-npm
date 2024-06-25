/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../utils/helpers';
import { baseNpmDevice } from '../basePmicDevice';
import { BatteryProfiler } from '../batteryProfiler';
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
    USBDetectStatusValues,
    USBPower,
} from '../types';
import setupBucks, { buckDefaults } from './buck';
import { ChargerModule } from './charger';
import setupFuelGauge from './fuelGauge';
import setupGpio from './gpio';
import setupLdo, { ldoDefaults } from './ldo';
import setupPof from './pof';
import setupShipMode from './shipMode';
import setupTimer from './timerConfig';

export const npm1300FWVersion = '1.2.3+0';

export const getNPM1300: INpmDevice = (shellParser, dialogHandler) => {
    const eventEmitter = new NpmEventEmitter();

    const devices = {
        noOfBucks: 2,
        noOfLdos: 2,
        noOfLEDs: 3,
        noOfBatterySlots: 3,
    };
    const baseDevice = baseNpmDevice(
        shellParser,
        dialogHandler,
        eventEmitter,
        devices,
        npm1300FWVersion
    );
    const batteryProfiler = shellParser
        ? BatteryProfiler(shellParser, eventEmitter)
        : undefined;
    let lastUptime = 0;
    let autoReboot = true;

    let pmicState: PmicState = shellParser
        ? 'pmic-connected'
        : 'ek-disconnected';

    const processModulePmic = ({ message }: LoggingEvent) => {
        switch (message) {
            case 'Power Failure Warning':
                batteryProfiler?.pofError();
                break;
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
            case 'No USB connection':
                eventEmitter.emit('onUsbPower', {
                    detectStatus: 'No USB connection',
                } as USBPower);
                break;
            case 'Default USB 100/500mA':
                eventEmitter.emit('onUsbPower', {
                    detectStatus: 'USB 100/500 mA',
                } as USBPower);
                break;
            case '1.5A High Power':
                eventEmitter.emit('onUsbPower', {
                    detectStatus: '1.5A High Power',
                } as USBPower);
                break;
            case '3A High Power':
                eventEmitter.emit('onUsbPower', {
                    detectStatus: '3A High Power',
                } as USBPower);
                break;
        }
    };

    const processModulePmicAdc = ({ timestamp, message }: LoggingEvent) => {
        const messageParts = message.split(',');
        const adcSample: AdcSample = {
            timestamp,
            vBat: 0,
            iBat: NaN,
            tBat: 0,
            soc: NaN,
            tte: NaN,
            ttf: NaN,
        };

        const fixed = (dp: number, value?: string | number) =>
            Number(Number(value ?? 0).toFixed(dp));

        messageParts.forEach(part => {
            const pair = part.split('=');
            switch (pair[0]) {
                case 'vbat':
                    adcSample.vBat = fixed(2, pair[1]);
                    break;
                case 'ibat':
                    adcSample.iBat = fixed(2, Number(pair[1] ?? NaN) * 1000);
                    break;
                case 'tbat':
                    adcSample.tBat = fixed(1, pair[1]);
                    break;
                case 'soc':
                    adcSample.soc = Math.min(
                        100,
                        Math.max(0, fixed(1, pair[1]))
                    );
                    break;
                case 'tte':
                    adcSample.tte = Number(pair[1] ?? NaN);
                    break;
                case 'ttf':
                    adcSample.ttf = Number(pair[1] ?? NaN);
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
        });

        doActionOnEvent(event);
    };

    const doActionOnEvent = (irqEvent: IrqEvent) => {
        switch (irqEvent.type) {
            case 'EVENTSVBUSIN0SET':
                processEventVBus0Set(irqEvent);
                break;
            case 'EVENTSBCHARGER1SET':
                if (irqEvent.event === 'EVENTCHGERROR') {
                    eventEmitter.emit('onErrorLogs', {
                        chargerError: [],
                        sensorError: [],
                    });

                    shellParser?.enqueueRequest(
                        'npmx errlog get',
                        {
                            onSuccess: res => {
                                let errors: string[] = [];
                                let currentState = '';

                                const emit = () => {
                                    switch (currentState) {
                                        case 'RSTCAUSE:':
                                            eventEmitter.emit('onErrorLogs', {
                                                resetCause: errors,
                                            });
                                            logger.warn(
                                                `Reset cause: ${errors.join(
                                                    ', '
                                                )}`
                                            );
                                            break;
                                        case 'CHARGER_ERROR:':
                                            eventEmitter.emit('onErrorLogs', {
                                                chargerError: errors,
                                            });
                                            logger.error(
                                                `Charger Errors: ${errors.join(
                                                    ', '
                                                )}`
                                            );
                                            break;
                                        case 'SENSOR_ERROR:':
                                            eventEmitter.emit('onErrorLogs', {
                                                sensorError: errors,
                                            });
                                            logger.error(
                                                `Sensor Errors: ${errors.join(
                                                    ', '
                                                )}`
                                            );
                                            break;
                                    }
                                };
                                const split = res?.split('\n');
                                split
                                    ?.map(item => item.trim())
                                    .forEach(item => {
                                        if (item.match(/[A-Z_]+:/)) {
                                            if (currentState) emit();
                                            currentState = item;
                                            errors = [];
                                        } else {
                                            errors.push(item);
                                        }
                                    });

                                emit();
                            },
                            onError: () => {
                                logger.warn(
                                    'error message unable to read error from device'
                                );
                            },
                            onTimeout: () => {
                                logger.warn('Reading latest error timed out.');
                            },
                        },
                        undefined,
                        true
                    );
                }
                break;
            case 'RSTCAUSE':
                eventEmitter.emit('onErrorLogs', {
                    resetCause: [irqEvent.event],
                });
                logger.warn(`Reset cause: ${irqEvent.event}`);
                break;
        }
    };

    const processEventVBus0Set = (irqEvent: IrqEvent) => {
        switch (irqEvent.event) {
            case 'EVENTVBUSREMOVED':
                eventEmitter.emit('onUsbPowered', false);
                break;
            case 'EVENTVBUSDETECTED':
                eventEmitter.emit('onUsbPowered', true);
                break;
        }
    };

    const startAdcSample = (intervalMs: number, samplingRate: number) => {
        sendCommand(`npm_adc sample ${samplingRate} ${intervalMs}`);
    };

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

    const offlineMode = !shellParser;

    const chargerModule = new ChargerModule(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const { buckGet, buckSet, buckCallbacks, buckRanges } = setupBucks(
        shellParser,
        eventEmitter,
        sendCommand,
        dialogHandler,
        offlineMode,
        devices.noOfBucks
    );

    const { ldoGet, ldoSet, ldoCallbacks, ldoRanges } = setupLdo(
        shellParser,
        eventEmitter,
        sendCommand,
        dialogHandler,
        offlineMode,
        devices.noOfLdos
    );

    const gpioModule = setupGpio(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const pofModule = setupPof(
        shellParser,
        eventEmitter,
        sendCommand,
        offlineMode
    );

    const { shipModeGet, shipModeSet, shipModeCallbacks } = setupShipMode(
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

    const { fuelGaugeGet, fuelGaugeSet, fuelGaugeCallbacks } = setupFuelGauge(
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

        releaseAll.push(...chargerModule.callbacks);
        releaseAll.push(...fuelGaugeCallbacks);

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx vbusin status cc get',
                    false,
                    undefined,
                    '(0|1|2|3)'
                ),
                res => {
                    eventEmitter.emitPartialEvent<USBPower>('onUsbPower', {
                        detectStatus: USBDetectStatusValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        releaseAll.push(...buckCallbacks);
        releaseAll.push(...ldoCallbacks);
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

        releaseAll.push(...pofModule.callbacks);
        releaseAll.push(...timerConfigModule.callbacks);
        releaseAll.push(...shipModeCallbacks);

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx vbusin current_limit', true),
                res => {
                    eventEmitter.emit('onUsbPower', {
                        currentLimiter: parseToNumber(res) / 1000,
                    });
                },
                noop
            )
        );
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

    const setVBusinCurrentLimiter = (amps: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                eventEmitter.emitPartialEvent<USBPower>('onUsbPower', {
                    currentLimiter: amps,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx vbusin current_limit set ${amps * 1000}`,
                    () => resolve(),
                    () => {
                        requestUpdate.vbusinCurrentLimiter();
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
            // Request all updates for nPM1300

            requestUpdate.usbPowered();

            chargerModule.get.all();

            for (let i = 0; i < devices.noOfBucks; i += 1) {
                requestUpdate.buckVOutNormal(i);
                requestUpdate.buckVOutRetention(i);
                requestUpdate.buckMode(i);
                requestUpdate.buckEnabled(i);
                requestUpdate.buckModeControl(i);
                requestUpdate.buckOnOffControl(i);
                requestUpdate.buckActiveDischarge(i);
            }

            for (let i = 0; i < devices.noOfLdos; i += 1) {
                requestUpdate.ldoVoltage(i);
                requestUpdate.ldoMode(i);
                requestUpdate.ldoEnabled(i);
                requestUpdate.ldoSoftStartEnabled(i);
                requestUpdate.ldoSoftStart(i);
                requestUpdate.ldoActiveDischarge(i);
                requestUpdate.ldoOnOffControl(i);
            }

            gpioModule.forEach(module => module.get.all());

            for (let i = 0; i < devices.noOfLEDs; i += 1) {
                requestUpdate.ledMode(i);
            }

            pofModule.get.all();
            timerConfigModule.get.all();

            requestUpdate.shipModeTimeToActive();
            requestUpdate.shipLongPressReset();

            requestUpdate.fuelGauge();
            requestUpdate.activeBatteryModel();
            requestUpdate.storedBatteryModel();

            requestUpdate.vbusinCurrentLimiter();
        },

        ...buckGet,

        ledMode: (index: number) => sendCommand(`npmx led mode get ${index}`),

        ...ldoGet,
        ...shipModeGet,
        ...fuelGaugeGet,

        usbPowered: () => sendCommand(`npmx vbusin status cc get`),

        vbusinCurrentLimiter: () =>
            sendCommand(`npmx vbusin current_limit get`),
    };

    return {
        ...baseDevice,
        release: () => {
            baseDevice.release();
            batteryProfiler?.release();
            releaseAll.forEach(release => release());
        },
        applyConfig: config =>
            new Promise<void>(resolve => {
                if (config.deviceType !== 'npm1300') {
                    resolve();
                    return;
                }

                const action = async () => {
                    try {
                        if (config.charger) {
                            const charger = config.charger;
                            await chargerModule.set.all(charger);
                        }

                        await Promise.all(
                            config.bucks.map((buck, index) =>
                                (async () => {
                                    await buckSet.setBuckVOutNormal(
                                        index,
                                        buck.vOutNormal
                                    );
                                    await buckSet.setBuckEnabled(
                                        index,
                                        buck.enabled
                                    );
                                    await buckSet.setBuckModeControl(
                                        index,
                                        buck.modeControl
                                    );
                                    await buckSet.setBuckVOutRetention(
                                        index,
                                        buck.vOutRetention
                                    );
                                    await buckSet.setBuckRetentionControl(
                                        index,
                                        buck.retentionControl
                                    );
                                    await buckSet.setBuckOnOffControl(
                                        index,
                                        buck.onOffControl
                                    );
                                    await buckSet.setBuckActiveDischarge(
                                        index,
                                        buck.activeDischarge
                                    );
                                    await buckSet.setBuckMode(index, buck.mode);
                                })()
                            )
                        );

                        await Promise.all(
                            config.ldos.map((ldo, index) =>
                                (async () => {
                                    await ldoSet.setLdoVoltage(
                                        index,
                                        ldo.voltage
                                    );
                                    await ldoSet.setLdoEnabled(
                                        index,
                                        ldo.enabled
                                    );
                                    await ldoSet.setLdoSoftStartEnabled(
                                        index,
                                        ldo.softStartEnabled
                                    );
                                    await ldoSet.setLdoSoftStart(
                                        index,
                                        ldo.softStart
                                    );
                                    await ldoSet.setLdoActiveDischarge(
                                        index,
                                        ldo.activeDischarge
                                    );
                                    await ldoSet.setLdoOnOffControl(
                                        index,
                                        ldo.onOffControl
                                    );
                                    await ldoSet.setLdoMode(index, ldo.mode);
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
                                setLedMode(index, led.mode)
                            )
                        );

                        if (config.pof) {
                            await pofModule.set.all(config.pof);
                        }

                        if (config.timerConfig) {
                            await timerConfigModule.set.all(config.timerConfig);
                        }

                        await shipModeSet.setShipModeTimeToActive(
                            config.ship.timeToActive
                        );
                        await shipModeSet.setShipLongPressReset(
                            config.ship.longPressReset
                        );

                        await fuelGaugeSet.setFuelGaugeEnabled(
                            config.fuelGauge
                        );

                        await setVBusinCurrentLimiter(
                            config.usbPower.currentLimiter
                        );
                    } catch (error) {
                        logger.error('Invalid File.');
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
                        doNotAskAgainStoreID: 'pmic1300-load-config-mismatch',
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

        getDeviceType: () => 'npm1300',
        getConnectionState: () => pmicState,
        startAdcSample,
        stopAdcSample,

        ...buckRanges,
        ...ldoRanges,

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

        ...buckSet,
        ...ldoSet,
        setLedMode,
        ...shipModeSet,
        ...fuelGaugeSet,

        setVBusinCurrentLimiter,

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

        getBatteryProfiler: () => batteryProfiler,
        setAutoRebootDevice: v => {
            if (v && v !== autoReboot && pmicState === 'pmic-pending-reboot') {
                baseDevice.kernelReset();
                pmicState = 'pmic-pending-rebooting';
                eventEmitter.emit('onPmicStateChange', pmicState);
            }
            autoReboot = v;
        },

        // Default settings
        buckDefaults: () => buckDefaults(devices.noOfBucks),
        ldoDefaults: () => ldoDefaults(devices.noOfLdos),
        ledDefaults: () => ledDefaults(devices.noOfLEDs),

        getBatteryConnectedVoltageThreshold: () => 1, // 1V

        chargerModule,
        pofModule,
        timerConfigModule,
        gpioModule,
    };
};
