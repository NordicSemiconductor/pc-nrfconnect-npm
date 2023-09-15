/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import EventEmitter from 'events';

import { getRange } from '../../../utils/helpers';
import { baseNpmDevice } from './basePmicDevice';
import { BatteryProfiler } from './batteryProfiler';
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
} from './pmicHelpers';
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
    Charger,
    GPIOValues,
    INpmDevice,
    IrqEvent,
    ITerm,
    Ldo,
    LdoMode,
    LoggingEvent,
    NTCThermistor,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    ProfileDownload,
    VTrickleFast,
} from './types';

export const getNPM1300: INpmDevice = (shellParser, dialogHandler) => {
    const eventEmitter = new EventEmitter();
    const devices = {
        noOfBucks: 2,
        charger: true,
        noOfLdos: 2,
        noOfGPIOs: 5,
    };
    const baseDevice = baseNpmDevice(
        shellParser,
        dialogHandler,
        eventEmitter,
        devices,
        '0.9.2+0'
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
                    'npmx adc ntc',
                    true,
                    undefined,
                    '(ntc_hi_z|ntc_10k|ntc_47k|ntc_100k)'
                ),
                res => {
                    const result = parseColonBasedAnswer(res);

                    let mode: NTCThermistor | null = null;
                    switch (result) {
                        case '10k.':
                        case 'ntc_10k.':
                            mode = '10 kΩ';
                            break;
                        case '47k.':
                        case 'ntc_47k.':
                            mode = '47 kΩ';
                            break;
                        case '100k.':
                        case 'ntc_100k.':
                            mode = '100 kΩ';
                            break;
                        case 'HI_Z.':
                        case 'ntc_hi_z.':
                            mode = 'HI Z';
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
                toRegex('npmx vbusin vbus status get'),
                res => {
                    eventEmitter.emit('onUsbPowered', parseToBoolean(res));
                },
                noop
            )
        );

        for (let i = 0; i < devices.noOfBucks; i += 1) {
            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npm1300_reg NPM_BUCK BUCKSTATUS'),
                    res => {
                        const value = Number.parseInt(res.split('=')[1], 16);

                        emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                // eslint-disable-next-line no-bitwise
                                enabled: (value & (i === 0 ? 0x4 : 0x64)) !== 0, // mV to V
                            },
                            i
                        );
                    },
                    noop
                )
            );

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
                    toRegex('npmx buck', true, i),
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
        }
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
    const setChargerNTCThermistor = (mode: NTCThermistor) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', {
                ntcThermistor: mode,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        let value = '';
                        switch (mode) {
                            case '100 kΩ':
                                value = 'ntc_100k';
                                break;
                            case '47 kΩ':
                                value = 'ntc_47k';
                                break;
                            case '10 kΩ':
                                value = 'ntc_10k';
                                break;
                            case 'HI Z':
                                value = 'ntc_hi_z';
                                break;
                        }
                        sendCommand(
                            `npmx adc ntc set ${value}`,
                            () => resolve(),
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerTChgResume();
                //         reject();
                //     }
                // );
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerVTermR();
                //         reject();
                //     }
                // );
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerTCold();
                //         reject();
                //     }
                // );
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerTCool();
                //         reject();
                //     }
                // );
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerTWarm();
                //         reject();
                //     }
                // );
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
                reject(new Error('Not implemented'));
                // sendCommand(
                //     `npmx charger module recharge set ${value}`,
                //     () => resolve(),
                //     () => {
                //         requestUpdate.chargerTHot();
                //         reject();
                //     }
                // );
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
                        `npmx buck set ${index} ${enabled ? '1' : '0'}`,
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
        chargerEnabledRecharging: () =>
            sendCommand('npmx charger module recharge get'),
        chargerNTCThermistor: () => sendCommand('npmx adc ntc get'),
        chargerTChgStop: () => sendCommand('npmx charger die_temp stop get'),
        chargerTChgResume: () =>
            sendCommand('npmx charger die_temp resume get'),
        chargerCurrentCool: () => console.log('Not Implemented'),
        chargerVTermR: () => console.log('Not Implemented'),
        chargerTCold: () => console.log('Not Implemented'),
        chargerTCool: () => console.log('Not Implemented'),
        chargerTWarm: () => console.log('Not Implemented'),
        chargerTHot: () => console.log('Not Implemented'),

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckEnabled: (index: number) =>
            sendCommand(`npm1300_reg NPM_BUCK BUCKSTATUS`),

        ldoVoltage: (index: number) =>
            sendCommand(`npmx ldsw ldo_voltage get ${index}`),
        ldoEnabled: (index: number) => sendCommand(`npmx ldsw get ${index}`),
        ldoMode: (index: number) => sendCommand(`npmx ldsw mode get ${index}`),

        fuelGauge: () => sendCommand('fuel_gauge get'),
        activeBatteryModel: () => sendCommand(`fuel_gauge model get`),
        storedBatteryModel: () => sendCommand(`fuel_gauge model list`),

        usbPowered: () => sendCommand(`npmx vbusin vbus status get`),
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
                if (config.charger) {
                    const charger = config.charger;
                    setChargerVTerm(charger.vTerm);
                    setChargerIChg(charger.iChg);
                    setChargerEnabled(charger.enabled);
                    setChargerITerm(charger.iTerm);
                    setChargerEnabledRecharging(charger.enableRecharging);
                    setChargerVTrickleFast(charger.vTrickleFast);
                    setChargerNTCThermistor(charger.ntcThermistor);
                }

                config.bucks.forEach((buck, index) => {
                    setBuckVOutNormal(index, buck.vOutNormal);
                    setBuckMode(index, buck.mode);
                    setBuckEnabled(index, buck.enabled);
                    setBuckModeControl(index, buck.modeControl);
                    setBuckVOutRetention(index, buck.vOutRetention);
                    setBuckRetentionControl(index, buck.retentionControl);
                    setBuckOnOffControl(index, buck.onOffControl);
                });

                config.ldos.forEach((ldo, index) => {
                    setLdoVoltage(index, ldo.voltage);
                    setLdoMode(index, ldo.mode);
                    setLdoEnabled(index, ldo.enabled);
                });

                setFuelGaugeEnabled(config.fuelGauge);
            };

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
            min: 0,
            max: 100,
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

        requestUpdate,

        setChargerVTerm,
        setChargerIChg,
        setChargerEnabled,
        setChargerVTrickleFast,
        setChargerITerm,
        setChargerEnabledRecharging,
        setChargerNTCThermistor,
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
        setLdoVoltage,
        setLdoEnabled,
        setLdoMode,

        setFuelGaugeEnabled,
        downloadFuelGaugeProfile,

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
