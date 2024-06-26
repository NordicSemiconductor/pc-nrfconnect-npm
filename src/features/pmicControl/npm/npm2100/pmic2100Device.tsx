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
    USBDetectStatusValues,
    USBPower,
} from '../types';
import getBoostModule, { numberOfBoosts } from './boost';
import setupFuelGauge from './fuelGauge';
import setupGpio from './gpio';
import setupLdo, { ldoDefaults } from './ldo';

export const npm2100FWVersion = '0.0.0+2992206765';

export const getNPM2100: INpmDevice = (shellParser, dialogHandler) => {
    const eventEmitter = new NpmEventEmitter();

    const devices = {
        noOfBoosts: numberOfBoosts,
        noOfBucks: 0,
        maxEnergyExtraction: true,
        noOfLdos: 1,
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
        dialogHandler,
        offlineMode
    );

    const { fuelGaugeGet, fuelGaugeSet, fuelGaugeCallbacks } = setupFuelGauge(
        shellParser,
        eventEmitter,
        sendCommand,
        dialogHandler,
        offlineMode
    );

    const boostModule = getBoostModule(
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

        releaseAll.push(...boostModule.map(boost => boost.callbacks).flat());
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

            requestUpdate.usbPowered();

            boostModule.forEach(boost => boost.get.all());

            requestUpdate.ldoVoltage();
            requestUpdate.ldoEnabled();
            requestUpdate.ldoMode();
            requestUpdate.ldoModeCtrl();
            requestUpdate.ldoPinSel();
            requestUpdate.ldoSoftStartLdo();
            requestUpdate.ldoSoftStartLoadSw();
            requestUpdate.ldoPinMode();
            requestUpdate.ldoOcp();
            requestUpdate.ldoLdoRamp();
            requestUpdate.ldoLdoHalt();

            gpioModule.forEach(module => module.get.all());

            for (let i = 0; i < devices.noOfLEDs; i += 1) {
                requestUpdate.ledMode(i);
            }

            requestUpdate.fuelGauge();
            requestUpdate.activeBatteryModel();
            requestUpdate.storedBatteryModel();
        },

        ledMode: (index: number) => sendCommand(`npmx led mode get ${index}`),

        ...ldoGet,
        ...fuelGaugeGet,

        usbPowered: () => sendCommand(`npmx vbusin status cc get`),
    };

    return {
        ...baseDevice,
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
                            config.boosts.map((boost, index) => async () => {
                                await boostModule[index].set.all(boost);
                            })
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
                                    await ldoSet.setLdoMode(index, ldo.mode);

                                    if (ldo.modeControl) {
                                        await ldoSet.setLdoModeControl(
                                            index,
                                            ldo.modeControl
                                        );
                                    }

                                    if (ldo.pinSel) {
                                        await ldoSet.setLdoPinSel(
                                            index,
                                            ldo.pinSel
                                        );
                                    }

                                    if (ldo.ldoSoftStart) {
                                        await ldoSet.setLdoSoftstart(
                                            index,
                                            ldo.ldoSoftStart
                                        );
                                    }

                                    if (ldo.loadSwitchSoftStart) {
                                        await ldoSet.setLoadSwitchSoftstart(
                                            index,
                                            ldo.loadSwitchSoftStart
                                        );
                                    }

                                    if (ldo.pinMode) {
                                        await ldoSet.setLdoPinMode(
                                            index,
                                            ldo.pinMode
                                        );
                                    }

                                    if (ldo.ocpEnabled) {
                                        await ldoSet.setLdoOcpEnabled(
                                            index,
                                            ldo.ocpEnabled
                                        );
                                    }

                                    if (ldo.ldoRampEnabled) {
                                        await ldoSet.setLdoRampEnabled(
                                            index,
                                            ldo.ldoRampEnabled
                                        );
                                    }

                                    if (ldo.ldoHaltEnabled) {
                                        await ldoSet.setLdoHaltEnabled(
                                            index,
                                            ldo.ldoHaltEnabled
                                        );
                                    }
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

                        await fuelGaugeSet.setFuelGaugeEnabled(
                            config.fuelGauge
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

        ...ldoSet,
        setLedMode,
        ...fuelGaugeSet,

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
        ldoDefaults: () => ldoDefaults(devices.noOfLdos),
        ledDefaults: () => ledDefaults(devices.noOfLEDs),

        boostModule,
        gpioModule,

        getBatteryConnectedVoltageThreshold: () => 0, // 0V
    };
};
