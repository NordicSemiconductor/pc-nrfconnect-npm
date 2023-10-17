/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';

import { getRange } from '../../../../utils/helpers';
import { baseNpmDevice } from '../basePmicDevice';
import { BatteryProfiler } from '../batteryProfiler';
import {
    isModuleDataPair,
    MAX_TIMESTAMP,
    noop,
    parseBatteryModel,
    parseColonBasedAnswer,
    parseLogData,
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../pmicHelpers';
import {
    AdcSample,
    AdcSampleSettings,
    BatteryModel,
    Buck,
    BuckMode,
    BuckModeControl,
    BuckOnOffControl,
    BuckRetentionControl,
    ChargeCurrentCool,
    ChargeCurrentCoolValues,
    Charger,
    GPIO,
    GPIODrive,
    GPIOMode,
    GPIOModeValues,
    GPIOPullMode,
    GPIOPullValues,
    GPIOValues,
    INpmDevice,
    IrqEvent,
    ITerm,
    Ldo,
    LdoMode,
    LED,
    LEDMode,
    LEDModeValues,
    LoggingEvent,
    NTCThermistor,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    POF,
    POFPolarity,
    POFPolarityValues,
    ProfileDownload,
    ShipModeConfig,
    SoftStart,
    TimerConfig,
    TimerMode,
    TimerModeValues,
    TimerPrescaler,
    TimerPrescalerValues,
    TimeToActive,
    USBDetectStatusValues,
    USBPower,
    VTrickleFast,
} from '../types';

export const npm1300FWVersion = '0.9.2+12';

export const getNPM1300: INpmDevice = (shellParser, dialogHandler) => {
    const eventEmitter = new EventEmitter();
    const devices = {
        noOfBucks: 2,
        charger: true,
        noOfLdos: 2,
        noOfGPIOs: 5,
        noOfLEDs: 3,
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
    let profileDownloadInProgress = false;
    let profileDownloadAborting = false;
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
                    detectStatus: 'USB 0.1/0.5 mA',
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
            iBat: 0,
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
                    adcSample.iBat = fixed(2, Number(pair[1]) * 1000);
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

    const processModuleFuelGauge = ({ message }: LoggingEvent) => {
        if (message === 'Battery model timeout') {
            shellParser?.setShellEchos(true);

            profileDownloadAborting = true;
            if (profileDownloadInProgress) {
                profileDownloadInProgress = false;
                const payload: ProfileDownload = {
                    state: 'aborted',
                    alertMessage: message,
                };

                eventEmitter.emit('onProfileDownloadUpdate', payload);
            }
        }
    };

    const processModulePmicCharger = ({ message }: LoggingEvent) => {
        const messageParts = message.split('=');
        const value = Number.parseInt(messageParts[1], 10);
        emitOnChargingStatusUpdate(value);
    };

    const startAdcSample = (intervalMs: number, samplingRate: number) => {
        sendCommand(`npm_adc sample ${samplingRate} ${intervalMs}`);
    };

    const stopAdcSample = () => {
        sendCommand(`npm_adc sample 0`);
    };

    const emitOnChargingStatusUpdate = (value: number) =>
        eventEmitter.emit('onChargingStatusUpdate', {
            // eslint-disable-next-line no-bitwise
            batteryDetected: (value & 0x01) > 0,
            // eslint-disable-next-line no-bitwise
            batteryFull: (value & 0x02) > 0,
            // eslint-disable-next-line no-bitwise
            trickleCharge: (value & 0x04) > 0,
            // eslint-disable-next-line no-bitwise
            constantCurrentCharging: (value & 0x08) > 0,
            // eslint-disable-next-line no-bitwise
            constantVoltageCharging: (value & 0x10) > 0,
            // eslint-disable-next-line no-bitwise
            batteryRechargeNeeded: (value & 0x20) > 0,
            // eslint-disable-next-line no-bitwise
            dieTempHigh: (value & 0x40) > 0,
            // eslint-disable-next-line no-bitwise
            supplementModeActive: (value & 0x80) > 0,
        } as PmicChargingState);

    const emitPartialEvent = <T,>(
        eventName: string,
        data: Partial<T>,
        index?: number
    ) => {
        eventEmitter.emit(
            eventName,
            index !== undefined
                ? ({
                      index,
                      data,
                  } as PartialUpdate<T>)
                : data
        );
    };

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
                            processModulePmicCharger(loggingEvent);
                            break;
                        case 'module_fg':
                            processModuleFuelGauge(loggingEvent);
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

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger termination_voltage normal', true),
                res => {
                    const value = parseToNumber(res);
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        vTerm: value / 1000, // mv to V
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger termination_voltage warm', true),
                res => {
                    const value = parseToNumber(res);
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        vTermR: value / 1000, // mv to V
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger charger_current', true),
                res => {
                    const value = parseToNumber(res);
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        iChg: value,
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger status', true),
                res => {
                    const value = parseToNumber(res);
                    emitOnChargingStatusUpdate(value);
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger module recharge',
                    true,
                    undefined,
                    '(1|0)'
                ),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        enableRecharging: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger module charger',
                    true,
                    undefined,
                    '(1|0)'
                ),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        enabled: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger trickle', true, undefined, '(2500|2900)'),
                res => {
                    const result = parseToNumber(res) / 1000;

                    if (result === 2.5 || result === 2.9) {
                        emitPartialEvent<Charger>('onChargerUpdate', {
                            vTrickleFast: result,
                        });
                    }
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger termination_current',
                    true,
                    undefined,
                    '(10|20)'
                ),
                res => {
                    const result = parseToNumber(res);

                    if (result === 10 || result === 20) {
                        emitPartialEvent<Charger>('onChargerUpdate', {
                            iTerm: `${result}%`,
                        });
                    }
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger discharging_current', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        iBatLim: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger die_temp stop', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tChgStop: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger die_temp resume', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tChgResume: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger ntc_temperature cold',
                    true,
                    undefined,
                    '-?[0-9]+'
                ),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tCold: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature cool', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tCool: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature warm', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tWarm: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger module full_cool',
                    true,
                    undefined,
                    '(0|1)'
                ),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        currentCool:
                            ChargeCurrentCoolValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature hot', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        tHot: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx adc ntc type',
                    true,
                    undefined,
                    '(0|10000|47000|100000)'
                ),
                res => {
                    const result = parseToNumber(res);

                    let mode: NTCThermistor | null = null;
                    switch (result) {
                        case 10000:
                            mode = '10 kΩ';
                            break;
                        case 47000:
                            mode = '47 kΩ';
                            break;
                        case 100000:
                            mode = '100 kΩ';
                            break;
                        case 0:
                            mode = 'Ignore NTC';
                            break;
                    }

                    if (mode) {
                        emitPartialEvent<Charger>('onChargerUpdate', {
                            ntcThermistor: mode,
                        });
                    }
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx adc ntc beta', true),
                res => {
                    emitPartialEvent<Charger>('onChargerUpdate', {
                        ntcBeta: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge', true, undefined, '(1|0)'),

                res => {
                    eventEmitter.emit('onFuelGauge', parseToBoolean(res));
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download begin'),
                () => shellParser?.setShellEchos(false),
                () => shellParser?.setShellEchos(true)
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download apply'),
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'applied',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }
                    shellParser?.setShellEchos(true);
                },
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'failed',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }
                    shellParser?.setShellEchos(true);
                }
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download abort'),
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'aborted',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }

                    shellParser?.setShellEchos(true);
                },
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'failed',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }

                    shellParser?.setShellEchos(true);
                }
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'fuel_gauge model',
                    true,
                    undefined,
                    '"[A-Za-z0-9\\s]+"'
                ),
                res => {
                    eventEmitter.emit(
                        'onActiveBatteryModelUpdate',
                        parseBatteryModel(parseColonBasedAnswer(res))
                    );
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model store'),
                () => {
                    requestUpdate.storedBatteryModel();
                    requestUpdate.activeBatteryModel();
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model list'),
                res => {
                    const models = res.split(
                        'Battery models stored in database:'
                    );
                    if (models.length < 2) {
                        eventEmitter.emit(
                            'onStoredBatteryModelUpdate',
                            undefined
                        );
                        return;
                    }
                    const stringModels = models[1].trim().split('\n');
                    const list = stringModels.map(parseBatteryModel);
                    eventEmitter.emit(
                        'onStoredBatteryModelUpdate',
                        list.length !== 0 ? list : undefined
                    );
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx vbusin status cc get',
                    false,
                    undefined,
                    '(0|1|2|3)'
                ),
                res => {
                    emitPartialEvent<USBPower>('onUsbPower', {
                        detectStatus: USBDetectStatusValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        for (let i = 0; i < devices.noOfBucks; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck voltage normal', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                vOutNormal: value / 1000, // mV to V
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck voltage retention', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                vOutRetention: value / 1000, // mV to V
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck vout select', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                mode: value === 0 ? 'vSet' : 'software',
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck status power', true, i),
                    res => {
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                enabled: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck gpio on_off', true, i, '(-?[0-9]+) (0)'),
                    res => {
                        const result = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                onOffControl:
                                    result === -1 ? 'Off' : GPIOValues[result],
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex(
                        'npmx buck gpio retention',
                        true,
                        i,
                        '(-?[0-9]+) (0)'
                    ),
                    res => {
                        const result = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                retentionControl:
                                    result === -1 ? 'Off' : GPIOValues[result],
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex(
                        'npmx buck gpio pwm_force',
                        true,
                        i,
                        '(-?[0-9]+) (0)'
                    ),
                    res => {
                        const result = parseToNumber(res);
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                modeControl:
                                    result === -1 ? 'Auto' : GPIOValues[result],
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck active_discharge', true, i, '(0|1)'),
                    res => {
                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                activeDischarge: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );
        }

        for (let i = 0; i < devices.noOfLdos; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw', true, i),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                enabled: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw mode', true, i),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                mode:
                                    parseToNumber(res) === 0
                                        ? 'ldoSwitch'
                                        : 'LDO',
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw ldo_voltage', true, i),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                voltage: parseToNumber(res) / 1000, // mV to V
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw soft_start enable', true, i, '(0|1)'),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                softStartEnabled: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex(
                        'npmx ldsw soft_start current',
                        true,
                        i,
                        '(25|50|75|100)'
                    ),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                softStart: parseToNumber(res) as SoftStart,
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw active_discharge enable', true, i),
                    res => {
                        emitPartialEvent<Ldo>(
                            'onLdoUpdate',
                            {
                                activeDischarge: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );
        }

        for (let i = 0; i < devices.noOfGPIOs; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx gpio mode', true, i, '[0-9]'),
                    res => {
                        const mode = GPIOModeValues[parseToNumber(res)];
                        if (mode) {
                            emitPartialEvent<GPIO>(
                                'onGPIOUpdate',
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

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx gpio pull', true, i, '(0|1|2)'),
                    res => {
                        const pull = GPIOPullValues[parseToNumber(res)];
                        if (pull) {
                            emitPartialEvent<GPIO>(
                                'onGPIOUpdate',
                                {
                                    pull,
                                },
                                i
                            );
                        }
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx gpio drive', true, i, '(1|6)'),
                    res => {
                        emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                drive: parseToNumber(res) as GPIODrive,
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx gpio open_drain', true, i, '(0|1)'),
                    res => {
                        emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                openDrain: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx gpio debounce', true, i, '(0|1)'),
                    res => {
                        emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                debounce: parseToBoolean(res),
                            },
                            i
                        );
                    },
                    noop
                )
            );
        }

        for (let i = 0; i < devices.noOfLEDs; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx leds mode', true, i, '[0-3]'),
                    res => {
                        const mode = LEDModeValues[parseToNumber(res)];
                        if (mode) {
                            emitPartialEvent<LED>(
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
                toRegex('npmx pof enable', true, undefined, '(0|1)'),
                res => {
                    emitPartialEvent<POF>('onPOFUpdate', {
                        enable: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx pof polarity', true, undefined, '(0|1)'),
                res => {
                    emitPartialEvent<POF>('onPOFUpdate', {
                        polarity: POFPolarityValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx pof threshold', true),
                res => {
                    emitPartialEvent<POF>('onPOFUpdate', {
                        threshold: parseToNumber(res) / 1000, // mV to V
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config mode', true, undefined, '[0-4]'),
                res => {
                    emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                        mode: TimerModeValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx timer config prescaler',
                    true,
                    undefined,
                    '[0-1]'
                ),
                res => {
                    emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                        prescaler: TimerPrescalerValues[parseToNumber(res)],
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config period', true),
                res => {
                    emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                        period: parseToNumber(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx ship config time',
                    true,
                    undefined,
                    '(16|32|64|96|304|608|1008|3008)'
                ),
                res => {
                    emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                        timeToActive: parseToNumber(res) as TimeToActive,
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship config inv_polarity', true),
                res => {
                    emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                        invPolarity: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship config inv_polarity', true),
                res => {
                    emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                        invPolarity: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship reset long_press', true),
                res => {
                    emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                        longPressReset: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship reset two_buttons', true),
                res => {
                    emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                        twoButtonReset: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        releaseAll.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship mode (ship|hibernate)'),
                () => {
                    eventEmitter.emit('onReboot', true);
                },
                noop
            )
        );
    }

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

    const setChargerVTerm = (value: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                vTerm: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_voltage normal set ${
                                value * 1000
                            }`, // mv to V
                            () => resolve(),
                            () => {
                                requestUpdate.chargerVTerm();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerVTerm();
                        reject();
                    });
            }
        });

    const setChargerIChg = (value: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                iChg: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() =>
                        sendCommand(
                            `npmx charger charger_current set ${value}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerIChg();
                                reject();
                            }
                        )
                    )
                    .catch(() => {
                        requestUpdate.chargerIChg();
                        reject();
                    });
            }
        });

    const setChargerVTrickleFast = (value: VTrickleFast) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                vTrickleFast: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger trickle set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerVTrickleFast();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerVTrickleFast();
                        reject();
                    });
            }
        });

    const setChargerITerm = (iTerm: ITerm) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                iTerm,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_current set ${Number.parseInt(
                                iTerm,
                                10
                            )}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerITerm();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerITerm();
                        reject();
                    });
            }
        });

    const setChargerBatLim = (iBatLim: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                iBatLim,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger discharging_current set ${iBatLim}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerBatLim();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerBatLim();
                        reject();
                    });
            }
        });

    const setChargerEnabledRecharging = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    enableRecharging: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerEnabledRecharging();
                        reject();
                    }
                );
            }
        });
    const setChargerNTCThermistor = (
        mode: NTCThermistor,
        autoSetBeta?: boolean
    ) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                ntcThermistor: mode,
            });

            let value = 0;
            let ntcBeta = 0;
            switch (mode) {
                case '100 kΩ':
                    value = 100000;
                    ntcBeta = 4250;
                    break;
                case '47 kΩ':
                    value = 47000;
                    ntcBeta = 4050;
                    break;
                case '10 kΩ':
                    value = 10000;
                    ntcBeta = 3380;
                    break;
                case 'Ignore NTC':
                    value = 0;
                    break;
            }

            if (autoSetBeta && mode !== 'Ignore NTC') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    ntcBeta,
                });
            }

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx adc ntc type set ${value}`,
                            () => {
                                if (autoSetBeta && mode !== 'Ignore NTC') {
                                    setChargerNTCBeta(ntcBeta)
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    resolve();
                                }
                            },
                            () => {
                                requestUpdate.chargerNTCThermistor();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerNTCThermistor();
                        reject();
                    });
            }
        });

    const setChargerNTCBeta = (ntcBeta: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                ntcBeta,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() =>
                        sendCommand(
                            `npmx adc ntc beta set ${ntcBeta}`,
                            () => {
                                resolve();
                            },
                            () => {
                                requestUpdate.chargerNTCBeta();
                                reject();
                            }
                        )
                    )
                    .catch(reject);
            }
        });

    const setChargerEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    () => {
                        resolve();
                    },
                    () => {
                        requestUpdate.chargerEnabled();
                        reject();
                    }
                );
            }
        });

    const setChargerTChgStop = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgStop: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger die_temp stop set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTChgStop();
                        reject();
                    }
                );
            }
        });

    const setChargerTChgResume = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgResume: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger die_temp resume set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTChgResume();
                        reject();
                    }
                );
            }
        });

    const setChargerCurrentCool = (mode: ChargeCurrentCool) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    currentCool: mode,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module full_cool set ${
                        mode === 'iCool' ? '0' : '1'
                    }`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerCurrentCool();
                        reject();
                    }
                );
            }
        });

    const setChargerVTermR = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermR: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger termination_voltage warm set ${value * 1000}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerVTermR();
                        reject();
                    }
                );
            }
        });

    const setChargerTCold = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tCold: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature cold set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTCold();
                        reject();
                    }
                );
            }
        });

    const setChargerTCool = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tCool: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature cool set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTCool();
                        reject();
                    }
                );
            }
        });

    const setChargerTWarm = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tWarm: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature warm set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTWarm();
                        reject();
                    }
                );
            }
        });

    const setChargerTHot = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', {
                    tHot: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature hot set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerTHot();
                        reject();
                    }
                );
            }
        });

    const setBuckVOutNormal = (index: number, value: number) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutNormal: value,
                        },
                        index
                    );

                    emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            mode: 'software',
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck voltage normal set ${index} ${value * 1000}`,
                        () =>
                            sendCommand(
                                `npmx buck vout select set ${index} 1`,
                                () => resolve(),
                                () => {
                                    requestUpdate.buckMode(index);
                                    reject();
                                }
                            ),
                        () => {
                            requestUpdate.buckVOutNormal(index);
                            reject();
                        }
                    );
                }
            });

        if (
            dialogHandler &&
            pmicState !== 'ek-disconnected' &&
            index === 1 &&
            value <= 1.6
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-1',
                    message: `Buck 2 powers the I2C communication required by this app. A voltage lower than 1.6 V might cause issues with the app connection.
                    Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: () => {
                        requestUpdate.buckVOutNormal(index);
                        reject();
                    },
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setBuckVOutRetention = (index: number, value: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutRetention: value,
                    },
                    index
                );

                resolve();
            } else {
                sendCommand(
                    `npmx buck voltage retention set ${index} ${value * 1000}`,
                    () => resolve(),
                    () => {
                        requestUpdate.buckVOutRetention(index);
                        reject();
                    }
                );
            }
        });

    const setBuckMode = (index: number, mode: BuckMode) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            mode,
                        },
                        index
                    );
                    resolve();
                } else {
                    sendCommand(
                        `npmx buck vout select set ${index} ${
                            mode === 'software' ? 1 : 0
                        }`,
                        () => {
                            requestUpdate.buckVOutNormal(index);
                            resolve();
                        },
                        () => {
                            requestUpdate.buckMode(index);
                            reject();
                        }
                    );
                }
            });

        // TODO Check software voltage as well
        if (
            dialogHandler &&
            pmicState !== 'ek-disconnected' &&
            index === 1 &&
            mode === 'software'
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                    message: `Buck 2 powers the I2C communication required by this app. A software voltage might be already set to less then 1.6 V . Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setBuckModeControl = (index: number, modeControl: BuckModeControl) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        modeControl,
                    },
                    index
                );

                resolve();
            } else {
                sendCommand(
                    `npmx buck gpio pwm_force set ${index} ${GPIOValues.findIndex(
                        v => v === modeControl
                    )} 0`,
                    () => resolve(),
                    () => {
                        requestUpdate.buckModeControl(index);
                        reject();
                    }
                );
            }
        });

    const setBuckOnOffControl = (
        index: number,
        onOffControl: BuckOnOffControl
    ) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        onOffControl,
                    },
                    index
                );

                resolve();
            } else {
                sendCommand(
                    `npmx buck gpio on_off set ${index} ${GPIOValues.findIndex(
                        v => v === onOffControl
                    )} 0`,
                    () => resolve(),
                    () => {
                        requestUpdate.buckOnOffControl(index);
                        reject();
                    }
                );
            }
        });

    const setBuckRetentionControl = (
        index: number,
        retentionControl: BuckRetentionControl
    ) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        retentionControl,
                    },
                    index
                );

                resolve();
            } else {
                sendCommand(
                    `npmx buck gpio retention set ${index} ${GPIOValues.findIndex(
                        v => v === retentionControl
                    )} 0`,
                    () => resolve(),
                    () => {
                        requestUpdate.buckRetentionControl(index);
                        reject();
                    }
                );
            }
        });

    const setBuckEnabled = (index: number, enabled: boolean) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            enabled,
                        },
                        index
                    );
                    resolve();
                } else {
                    sendCommand(
                        `npmx buck status power set ${index} ${
                            enabled ? '1' : '0'
                        }`,
                        () => resolve(),
                        () => {
                            requestUpdate.buckEnabled(index);
                            reject();
                        }
                    );
                }
            });

        if (
            dialogHandler &&
            pmicState !== 'ek-disconnected' &&
            index === 1 &&
            !enabled
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckEnabled-1',
                    message: `Disabling the buck 2 might effect I2C communications to the PMIC chip and hance you might get
                disconnected from the app. Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setBuckActiveDischargeEnabled = (
        index: number,
        activeDischargeEnabled: boolean
    ) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        activeDischarge: activeDischargeEnabled,
                    },
                    index
                );

                resolve();
            } else {
                sendCommand(
                    `npmx buck active_discharge set ${index} ${
                        activeDischargeEnabled ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        requestUpdate.buckActiveDischarge(index);
                        reject();
                    }
                );
            }
        });

    const setLdoVoltage = (index: number, voltage: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Ldo>(
                'onLdoUpdate',
                {
                    voltage,
                },
                index
            );

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setLdoMode(index, 'LDO')
                    .then(() => {
                        sendCommand(
                            `npmx ldsw ldo_voltage set ${index} ${
                                voltage * 1000
                            }`,
                            () => resolve(),
                            () => {
                                requestUpdate.ldoVoltage(index);
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.ldoVoltage(index);
                        reject();
                    });
            }
        });

    const setLdoEnabled = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        enabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.ldoEnabled(index);
                        reject();
                    }
                );
            }
        });
    const setLdoMode = (index: number, mode: LdoMode) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode,
                        },
                        index
                    );
                    resolve();
                } else {
                    sendCommand(
                        `npmx ldsw mode set ${index} ${
                            mode === 'ldoSwitch' ? '0' : '1'
                        }`,
                        () => resolve(),
                        () => {
                            requestUpdate.ldoMode(index);
                            reject();
                        }
                    );
                }
            });

        if (
            dialogHandler &&
            pmicState !== 'ek-disconnected' &&
            mode === 'LDO'
        ) {
            const ldo1Message = (
                <span>
                    Before enabling LDO1, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO1
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT1</span>{' '}
                            - LS
                            <span className="subscript">IN1</span>.
                        </li>
                        <li>
                            Disconnect HIGH - LS
                            <span className="subscript">OUT1</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN1, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            const ldo2Message = (
                <span>
                    Before enabling LDO2, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO2
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT2</span>{' '}
                            - LS
                            <span className="subscript">IN2</span>.
                        </li>
                        <li>
                            Disconnect LOW - LS
                            <span className="subscript">OUT2</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN2, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic1300-setLdoMode-${index}`,
                    message: index === 0 ? ldo1Message : ldo2Message,
                    confirmLabel: 'OK',
                    optionalLabel: "OK, don't ask again",
                    cancelLabel: 'Cancel',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setLdoSoftStartEnabled = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartEnabled: enabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw soft_start enable set ${index} ${
                        enabled ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        requestUpdate.ldoSoftStartEnabled(index);
                        reject();
                    }
                );
            }
        });

    const setLdoSoftStart = (index: number, softStart: SoftStart) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStart,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw soft_start current set ${index} ${softStart}`,
                    () => resolve(),
                    () => {
                        requestUpdate.ldoSoftStart(index);
                        reject();
                    }
                );
            }
        });

    const setLdoActiveDischarge = (index: number, activeDischarge: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        activeDischarge,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw active_discharge enable set ${index} ${
                        activeDischarge ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        requestUpdate.ldoActiveDischarge(index);
                        reject();
                    }
                );
            }
        });

    const setGpioMode = (index: number, mode: GPIOMode) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        mode,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio mode set ${index} ${GPIOModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.gpioMode(index);
                        reject();
                    }
                );
            }
        });

    const setGpioPull = (index: number, pull: GPIOPullMode) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        pull,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio pull set ${index} ${GPIOPullValues.findIndex(
                        p => p === pull
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.gpioPull(index);
                        reject();
                    }
                );
            }
        });

    const setGpioDrive = (index: number, drive: GPIODrive) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        drive,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio drive set ${index} ${drive}`,
                    () => resolve(),
                    () => {
                        requestUpdate.gpioDrive(index);
                        reject();
                    }
                );
            }
        });

    const setGpioOpenDrain = (index: number, openDrain: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        openDrain,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio open_drain set ${index} ${
                        openDrain ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        requestUpdate.gpioOpenDrain(index);
                        reject();
                    }
                );
            }
        });

    const setGpioDebounce = (index: number, debounce: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        debounce,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio debounce set ${index} ${debounce ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.gpioDebounce(index);
                        reject();
                    }
                );
            }
        });

    const setFuelGaugeEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                eventEmitter.emit('onFuelGauge', enabled);
                resolve();
            } else {
                sendCommand(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.fuelGauge();
                        reject();
                    }
                );
            }
        });

    const setLedMode = (index: number, mode: LEDMode) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<LED>(
                    'onLEDUpdate',
                    {
                        mode,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx leds mode set ${index} ${LEDModeValues.findIndex(
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

    const setPOFEnabled = (enable: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<POF>('onPOFUpdate', {
                    enable,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof enable set ${enable ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.pofEnable();
                        reject();
                    }
                );
            }
        });

    const setPOFThreshold = (threshold: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<POF>('onPOFUpdate', {
                    threshold,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof threshold set ${threshold * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        requestUpdate.pofThreshold();
                        reject();
                    }
                );
            }
        });

    const setPOFPolarity = (polarity: POFPolarity) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<POF>('onPOFUpdate', {
                    polarity,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof polarity set ${POFPolarityValues.findIndex(
                        p => p === polarity
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.pofPolarity();
                        reject();
                    }
                );
            }
        });

    const setTimerConfigMode = (mode: TimerMode) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                    mode,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx timer config mode set ${TimerModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.timerConfigMode();
                        reject();
                    }
                );
            }
        });

    const setTimerConfigPrescaler = (prescaler: TimerPrescaler) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                    prescaler,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx timer config prescaler set ${TimerPrescalerValues.findIndex(
                        p => p === prescaler
                    )}`,
                    () => resolve(),
                    () => {
                        requestUpdate.timerConfigPrescaler();
                        reject();
                    }
                );
            }
        });

    const setTimerConfigPeriod = (period: number) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<TimerConfig>('onTimerConfigUpdate', {
                    period,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx timer config period set ${period}`,
                    () => resolve(),
                    () => {
                        requestUpdate.timerConfigPeriod();
                        reject();
                    }
                );
            }
        });

    const setShipModeTimeToActive = (timeToActive: TimeToActive) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    timeToActive,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship config time set ${timeToActive}`,
                    () => resolve(),
                    () => {
                        requestUpdate.shipModeTimeToActive();
                        reject();
                    }
                );
            }
        });

    const setShipInvertPolarity = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    invPolarity: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship config inv_polarity set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.shipInvertPolarity();
                        reject();
                    }
                );
            }
        });

    const setShipLongPressReset = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    longPressReset: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship reset long_press set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.shipLongPressReset();
                        reject();
                    }
                );
            }
        });

    const setShipTwoButtonReset = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    twoButtonReset: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship reset two_buttons set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.shipTwoButtonReset();
                        reject();
                    }
                );
            }
        });

    const downloadFuelGaugeProfile = (profile: Buffer) => {
        const chunkSize = 256;
        const chunks = Math.ceil(profile.byteLength / chunkSize);

        return new Promise<void>((resolve, reject) => {
            const downloadData = (chunk = 0) => {
                sendCommand(
                    `fuel_gauge model download "${profile
                        .subarray(chunk * chunkSize, (chunk + 1) * chunkSize)
                        .toString()
                        .replaceAll('"', '\\"')}"`,
                    () => {
                        const profileDownload: ProfileDownload = {
                            state: 'downloading',
                            completeChunks: chunk + 1,
                            totalChunks: Math.ceil(
                                profile.byteLength / chunkSize
                            ),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );

                        if (
                            profileDownloadInProgress &&
                            !profileDownloadAborting &&
                            chunk + 1 !== chunks
                        ) {
                            downloadData(chunk + 1);
                        } else {
                            resolve();
                            requestUpdate.activeBatteryModel();
                        }
                    },
                    res => {
                        () => {
                            if (profileDownloadInProgress) {
                                profileDownloadInProgress = false;
                                profileDownloadAborting = false;
                                const profileDownload: ProfileDownload = {
                                    state: 'failed',
                                    alertMessage: parseColonBasedAnswer('res'),
                                };
                                eventEmitter.emit(
                                    'onProfileDownloadUpdate',
                                    profileDownload
                                );
                            }
                            reject(res);
                        };
                    },
                    false
                );
            };

            profileDownloadInProgress = true;
            profileDownloadAborting = false;
            sendCommand(
                'fuel_gauge model download begin',
                () => downloadData(),
                () => reject()
            );
        });
    };

    const abortDownloadFuelGaugeProfile = () =>
        new Promise<void>((resolve, reject) => {
            const profileDownload: ProfileDownload = {
                state: 'aborting',
            };
            eventEmitter.emit('onProfileDownloadUpdate', profileDownload);

            profileDownloadAborting = true;
            sendCommand(
                `fuel_gauge model download abort`,
                () => {
                    resolve();
                },
                () => {
                    reject();
                }
            );
        });

    const applyDownloadFuelGaugeProfile = () =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model download apply 0`,
                () => {
                    resolve();
                },
                () => reject()
            );
        });

    const setActiveBatteryModel = (name: string) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model set "${name}"`,
                () => resolve(),
                () => {
                    requestUpdate.activeBatteryModel();
                    reject();
                }
            );
        });

    const setBatteryStatusCheckEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `npm_chg_status_check set ${enabled ? '1' : '0'}`,
                () => resolve(),
                () => reject()
            );
        });

    const requestUpdate = {
        pmicChargingState: () => sendCommand('npmx charger status get'),
        chargerVTerm: () =>
            sendCommand('npmx charger termination_voltage normal get'),
        chargerIChg: () => sendCommand('npmx charger charger_current get'),
        chargerEnabled: () => sendCommand('npmx charger module charger get'),
        chargerVTrickleFast: () => sendCommand('npmx charger trickle get'),
        chargerITerm: () => sendCommand('npmx charger termination_current get'),
        chargerBatLim: () =>
            sendCommand('npmx charger discharging_current get'),
        chargerEnabledRecharging: () =>
            sendCommand('npmx charger module recharge get'),
        chargerNTCThermistor: () => sendCommand('npmx adc ntc type get'),
        chargerNTCBeta: () => sendCommand('npmx adc ntc beta get'),
        chargerTChgStop: () => sendCommand('npmx charger die_temp stop get'),
        chargerTChgResume: () =>
            sendCommand('npmx charger die_temp resume get'),
        chargerCurrentCool: () =>
            sendCommand('npmx charger module full_cool get'),
        chargerVTermR: () =>
            sendCommand('npmx charger termination_voltage warm get'),
        chargerTCold: () =>
            sendCommand('npmx charger ntc_temperature cold get'),
        chargerTCool: () =>
            sendCommand('npmx charger ntc_temperature cool get'),
        chargerTWarm: () =>
            sendCommand('npmx charger ntc_temperature warm get'),
        chargerTHot: () => sendCommand('npmx charger ntc_temperature hot get'),

        gpioMode: (index: number) => sendCommand(`npmx gpio mode get ${index}`),
        gpioPull: (index: number) => sendCommand(`npmx gpio pull get ${index}`),
        gpioDrive: (index: number) =>
            sendCommand(`npmx gpio drive get ${index}`),
        gpioOpenDrain: (index: number) =>
            sendCommand(`npmx gpio open_drain get ${index}`),
        gpioDebounce: (index: number) =>
            sendCommand(`npmx gpio debounce get ${index}`),

        ledMode: (index: number) => sendCommand(`npmx leds mode get ${index}`),

        buckVOutNormal: (index: number) =>
            sendCommand(`npmx buck voltage normal get ${index}`),
        buckVOutRetention: (index: number) =>
            sendCommand(`npmx buck voltage retention get ${index}`),
        buckMode: (index: number) =>
            sendCommand(`npmx buck vout select get ${index}`),
        buckModeControl: (index: number) =>
            sendCommand(`npmx buck gpio pwm_force get ${index}`),
        buckOnOffControl: (index: number) =>
            sendCommand(`npmx buck gpio on_off get ${index}`),
        buckRetentionControl: (index: number) =>
            sendCommand(`npmx buck gpio retention get ${index}`),
        buckEnabled: (index: number) =>
            sendCommand(`npmx buck status power get ${index}`),
        buckActiveDischarge: (index: number) =>
            sendCommand(`npmx buck active_discharge get ${index}`),

        ldoVoltage: (index: number) =>
            sendCommand(`npmx ldsw ldo_voltage get ${index}`),
        ldoEnabled: (index: number) => sendCommand(`npmx ldsw get ${index}`),
        ldoMode: (index: number) => sendCommand(`npmx ldsw mode get ${index}`),
        ldoSoftStartEnabled: (index: number) =>
            sendCommand(`npmx ldsw soft_start enable get ${index}`),
        ldoSoftStart: (index: number) =>
            sendCommand(`npmx ldsw soft_start current get ${index}`),
        ldoActiveDischarge: (index: number) =>
            sendCommand(`npmx ldsw active_discharge enable get ${index}`),

        pofEnable: () => sendCommand(`npmx pof enable get`),
        pofPolarity: () => sendCommand(`npmx pof polarity get`),
        pofThreshold: () => sendCommand(`npmx pof threshold get`),

        timerConfigMode: () => sendCommand(`npmx timer config mode get`),
        timerConfigPrescaler: () =>
            sendCommand(`npmx timer config prescaler get`),
        timerConfigPeriod: () => sendCommand(`npmx timer config period get`),

        shipModeTimeToActive: () => sendCommand(`npmx ship config time get`),
        shipInvertPolarity: () =>
            sendCommand(`npmx ship config inv_polarity get`),
        shipLongPressReset: () => sendCommand(`npmx ship reset long_press get`),
        shipTwoButtonReset: () =>
            sendCommand(`npmx ship reset two_buttons get`),

        fuelGauge: () => sendCommand('fuel_gauge get'),
        activeBatteryModel: () => sendCommand(`fuel_gauge model get`),
        storedBatteryModel: () => sendCommand(`fuel_gauge model list`),

        usbPowered: () => sendCommand(`npmx vbusin status cc get`),
    };

    return {
        ...baseDevice,
        release: () => {
            baseDevice.release();
            batteryProfiler?.release();
            releaseAll.forEach(release => release());
        },
        applyConfig: config => {
            if (config.deviceType !== 'npm1300') {
                return;
            }

            const action = () => {
                try {
                    if (config.charger) {
                        const charger = config.charger;
                        setChargerVTerm(charger.vTerm);
                        setChargerIChg(charger.iChg);
                        setChargerEnabled(charger.enabled);
                        setChargerITerm(charger.iTerm);
                        setChargerBatLim(charger.iBatLim);
                        setChargerEnabledRecharging(charger.enableRecharging);
                        setChargerCurrentCool(charger.currentCool);
                        setChargerVTrickleFast(charger.vTrickleFast);
                        setChargerNTCThermistor(charger.ntcThermistor);
                        setChargerNTCBeta(charger.ntcBeta);
                        setChargerTChgResume(charger.tChgResume);
                        setChargerTChgStop(charger.tChgStop);
                        setChargerVTermR(charger.vTermR);
                    }

                    config.bucks.forEach((buck, index) => {
                        setBuckVOutNormal(index, buck.vOutNormal);
                        setBuckMode(index, buck.mode);
                        setBuckEnabled(index, buck.enabled);
                        setBuckModeControl(index, buck.modeControl);
                        setBuckVOutRetention(index, buck.vOutRetention);
                        setBuckRetentionControl(index, buck.retentionControl);
                        setBuckOnOffControl(index, buck.onOffControl);
                        setBuckActiveDischargeEnabled(
                            index,
                            buck.activeDischarge
                        );
                    });

                    config.ldos.forEach((ldo, index) => {
                        setLdoVoltage(index, ldo.voltage);
                        setLdoMode(index, ldo.mode);
                        setLdoEnabled(index, ldo.enabled);
                        setLdoSoftStartEnabled(index, ldo.softStartEnabled);
                        setLdoSoftStart(index, ldo.softStart);
                        setLdoActiveDischarge(index, ldo.activeDischarge);
                    });

                    config.gpios.forEach((gpio, index) => {
                        setGpioMode(index, gpio.mode);
                        setGpioPull(index, gpio.pull);
                        setGpioDrive(index, gpio.drive);
                        setGpioOpenDrain(index, gpio.openDrain);
                        setGpioDebounce(index, gpio.debounce);
                    });

                    config.leds.forEach((led, index) => {
                        setLedMode(index, led.mode);
                    });

                    setPOFEnabled(config.pof.enable);
                    setPOFPolarity(config.pof.polarity);
                    setPOFThreshold(config.pof.threshold);

                    setTimerConfigMode(config.timerConfig.mode);
                    setTimerConfigPrescaler(config.timerConfig.prescaler);
                    setTimerConfigPeriod(config.timerConfig.period);

                    setShipModeTimeToActive(config.ship.timeToActive);
                    setShipInvertPolarity(config.ship.invPolarity);
                    setShipLongPressReset(config.ship.longPressReset);
                    setShipTwoButtonReset(config.ship.twoButtonReset);

                    setFuelGaugeEnabled(config.fuelGauge);
                } catch (error) {
                    logger.error('Invalid File.');
                }
            };

            if (config.firmwareVersion == null) {
                logger.error('Invalid File.');
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
                    onConfirm: action,
                    onCancel: () => {},
                    onOptional: action,
                };

                dialogHandler(warningDialog);
                return;
            }

            action();
        },

        getDeviceType: () => 'npm1300',
        getConnectionState: () => pmicState,
        startAdcSample,
        stopAdcSample,

        getChargerVoltageRange: () =>
            getRange([
                {
                    min: 3.5,
                    max: 3.65,
                    step: 0.05,
                },
                {
                    min: 4.0,
                    max: 4.45,
                    step: 0.05,
                },
            ]).map(v => Number(v.toFixed(2))),
        getChargerVTermRRange: () =>
            getRange([
                {
                    min: 3.5,
                    max: 3.65,
                    step: 0.05,
                },
                {
                    min: 4.0,
                    max: 4.45,
                    step: 0.05,
                },
            ]).map(v => Number(v.toFixed(2))),
        getChargerJeitaRange: () => ({
            min: -20,
            max: 60,
        }),
        getChargerChipThermalRange: () => ({
            min: 50,
            max: 110,
        }),
        getChargerCurrentRange: () => ({
            min: 32,
            max: 800,
            decimals: 0,
            step: 2,
        }),
        getChargerIBatLimRange: () => ({
            min: 268,
            max: 1340,
            decimals: 0,
            step: 1,
        }),
        getChargerNTCBetaRange: () => ({
            min: 0,
            max: 4294967295,
            decimals: 0,
            step: 1,
        }),

        getBuckVoltageRange: () => ({
            min: 1,
            max: 3.3,
            decimals: 1,
        }),

        getBuckRetVOutRange: () => ({
            min: 1,
            max: 3,
            decimals: 1,
        }),

        getLdoVoltageRange: () => ({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        }),

        getPOFThresholdRange: () => ({
            min: 2.6,
            max: 3.5,
            decimals: 1,
            step: 0.1,
        }),

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

        setChargerVTerm,
        setChargerIChg,
        setChargerEnabled,
        setChargerVTrickleFast,
        setChargerITerm,
        setChargerBatLim,
        setChargerEnabledRecharging,
        setChargerNTCThermistor,
        setChargerNTCBeta,
        setChargerTChgStop,
        setChargerTChgResume,
        setChargerCurrentCool,
        setChargerVTermR,
        setChargerTCold,
        setChargerTCool,
        setChargerTWarm,
        setChargerTHot,
        setBuckVOutNormal,
        setBuckVOutRetention,
        setBuckMode,
        setBuckEnabled,
        setBuckModeControl,
        setBuckOnOffControl,
        setBuckRetentionControl,
        setBuckActiveDischarge: setBuckActiveDischargeEnabled,
        setLdoVoltage,
        setLdoEnabled,
        setLdoMode,
        setLdoSoftStartEnabled,
        setLdoSoftStart,
        setLdoActiveDischarge,
        setGpioMode,
        setGpioPull,
        setGpioDrive,
        setGpioOpenDrain,
        setGpioDebounce,
        setLedMode,
        setPOFEnabled,
        setPOFThreshold,
        setPOFPolarity,
        setTimerConfigMode,
        setTimerConfigPrescaler,
        setTimerConfigPeriod,
        setShipInvertPolarity,
        setShipModeTimeToActive,
        setShipLongPressReset,
        setShipTwoButtonReset,

        setFuelGaugeEnabled,
        downloadFuelGaugeProfile,

        enterShipMode: () => sendCommand(`npmx ship mode ship`),
        enterShipHibernateMode: () => sendCommand(`npmx ship mode hibernate`),

        setActiveBatteryModel,

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

        setBatteryStatusCheckEnabled,

        onProfileDownloadUpdate: (
            handler: (payload: ProfileDownload, error?: string) => void
        ) => {
            eventEmitter.on('onProfileDownloadUpdate', handler);
            return () => {
                eventEmitter.removeListener('onProfileDownloadUpdate', handler);
            };
        },

        abortDownloadFuelGaugeProfile,
        applyDownloadFuelGaugeProfile,

        getBatteryProfiler: () => batteryProfiler,
        setAutoRebootDevice: v => {
            if (v && v !== autoReboot && pmicState === 'pmic-pending-reboot') {
                baseDevice.kernelReset();
                pmicState = 'pmic-pending-rebooting';
                eventEmitter.emit('onPmicStateChange', pmicState);
            }
            autoReboot = v;
        },
    };
};
