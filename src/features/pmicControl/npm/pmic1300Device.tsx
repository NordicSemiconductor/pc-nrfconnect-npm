/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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
        noOfChargers: 1,
        noOfLdos: 2,
        noOfGPIOs: 5,
    };
    const baseDevice = baseNpmDevice(
        shellParser,
        dialogHandler,
        eventEmitter,
        devices,
        '0.7.0+0'
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
                    adcSample.soc = fixed(1, pair[1]);
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

    shellParser?.onShellLoggingEvent(logEvent => {
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
    });

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
        index: number,
        data: Partial<T>
    ) => {
        eventEmitter.emit(eventName, {
            index,
            data,
        } as PartialUpdate<T>);
    };

    const releaseAll: (() => void)[] = [];

    if (shellParser) {
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
                    emitPartialEvent<Charger>('onChargerUpdate', 0, {
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
                    emitPartialEvent<Charger>('onChargerUpdate', 0, {
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
                    emitPartialEvent<Charger>('onChargerUpdate', 0, {
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
                    emitPartialEvent<Charger>('onChargerUpdate', 0, {
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
                        emitPartialEvent<Charger>('onChargerUpdate', 0, {
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
                        emitPartialEvent<Charger>('onChargerUpdate', 0, {
                            iTerm: `${result}%`,
                        });
                    }
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
                            mode = '10kΩ';
                            break;
                        case '47k.':
                        case 'ntc_47k.':
                            mode = '47kΩ';
                            break;
                        case '100k.':
                        case 'ntc_100k.':
                            mode = '100kΩ';
                            break;
                    }

                    if (mode) {
                        emitPartialEvent<Charger>('onChargerUpdate', 0, {
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

                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            // eslint-disable-next-line no-bitwise
                            enabled: (value & (i === 0 ? 0x4 : 0x64)) !== 0, // mV to V
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck voltage normal', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            vOutNormal: value / 1000, // mV to V
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck voltage retention', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            vOutRetention: value / 1000, // mV to V
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck vout select', true, i),
                    res => {
                        const value = parseToNumber(res);
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            mode: value === 0 ? 'vSet' : 'software',
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck', true, i),
                    res => {
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            enabled: parseToBoolean(res),
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx buck gpio on_off', true, i, '(-?[0-9]+) (0)'),
                    res => {
                        const result = parseToNumber(res);
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            onOffControl:
                                result === -1 ? 'Off' : GPIOValues[result],
                        });
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
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            retentionControl:
                                result === -1 ? 'Off' : GPIOValues[result],
                        });
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
                        emitPartialEvent<Buck>('onBuckUpdate', i, {
                            modeControl:
                                result === -1 ? 'Auto' : GPIOValues[result],
                        });
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
                        emitPartialEvent<Ldo>('onLdoUpdate', i, {
                            enabled: parseToBoolean(res),
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw mode', true, i),
                    res => {
                        emitPartialEvent<Ldo>('onLdoUpdate', i, {
                            mode:
                                parseToNumber(res) === 0 ? 'ldoSwitch' : 'LDO',
                        });
                    },
                    noop
                )
            );

            releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('npmx ldsw ldo_voltage', true, i),
                    res => {
                        emitPartialEvent<Ldo>('onLdoUpdate', i, {
                            voltage: parseToNumber(res) / 1000, // mV to V
                        });
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

    const setChargerVTerm = (index: number, value: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                vTerm: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(index, false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_voltage normal set ${
                                value * 1000
                            }`, // mv to V
                            () => resolve(),
                            () => {
                                requestUpdate.chargerVTerm(index);
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerVTerm(index);
                        reject();
                    });
            }
        });

    const setChargerIChg = (index: number, value: number) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                iChg: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(index, false)
                    .then(() =>
                        sendCommand(
                            `npmx charger charger_current set ${value}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerIChg(index);
                                reject();
                            }
                        )
                    )
                    .catch(() => {
                        requestUpdate.chargerIChg(index);
                        reject();
                    });
            }
        });

    const setChargerVTrickleFast = (index: number, value: VTrickleFast) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                vTrickleFast: value,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(index, false)
                    .then(() => {
                        sendCommand(
                            `npmx charger trickle set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerVTrickleFast(index);
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerVTrickleFast(index);
                        reject();
                    });
            }
        });

    const setChargerITerm = (index: number, iTerm: ITerm) =>
        new Promise<void>((resolve, reject) => {
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                iTerm,
            });

            if (pmicState === 'ek-disconnected') {
                resolve();
            } else {
                setChargerEnabled(index, false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_current set ${Number.parseInt(
                                iTerm,
                                10
                            )}`,
                            () => resolve(),
                            () => {
                                requestUpdate.chargerITerm(index);
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        requestUpdate.chargerITerm(index);
                        reject();
                    });
            }
        });

    const setChargerEnabledRecharging = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', index, {
                    enableRecharging: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerEnabledRecharging(index);
                        reject();
                    }
                );
            }
        });
    const setChargerNTCThermistor = (index: number, mode: NTCThermistor) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', index, {
                    ntcThermistor: mode,
                });
                resolve();
            } else {
                let value = '';
                switch (mode) {
                    case '100kΩ':
                        value = 'ntc_100k';
                        break;
                    case '47kΩ':
                        value = 'ntc_47k';
                        break;
                    case '10kΩ':
                        value = 'ntc_10k';
                        break;
                }
                sendCommand(
                    `npmx adc ntc set ${value}`,
                    () => resolve(),
                    () => {
                        requestUpdate.chargerNTCThermistor(index);
                        reject();
                    }
                );
            }
        });

    const setChargerEnabled = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Charger>('onChargerUpdate', index, {
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
                        requestUpdate.chargerEnabled(index);
                        reject();
                    }
                );
            }
        });

    const setBuckVOutNormal = (index: number, value: number) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        vOutNormal: value,
                    });

                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        mode: 'software',
                    });

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

        if (pmicState !== 'ek-disconnected' && index === 1 && value <= 1.7) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-1',
                    message: `Buck 2 Powers the I2C communications that are needed for this app. 
                    Any voltage lower that 1.7v Might cause issues with the Connection to the app. Are you sure you want to continue`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
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
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    vOutRetention: value,
                });

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
                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        mode,
                    });
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
            pmicState !== 'ek-disconnected' &&
            index === 1 &&
            mode === 'software'
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                    message: `Buck 2 Powers the I2C communications that are needed for this app. 
                    Software voltage might be already set to less then 1.7V . Are you sure you want to continue`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
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
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    modeControl,
                });

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
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    onOffControl,
                });

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
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    retentionControl,
                });

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
                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        enabled,
                    });
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

        if (pmicState !== 'ek-disconnected' && index === 1 && !enabled) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckEnabled-1',
                    message: `Disabling the buck 2 might effect I2C communications to the PMIC 1300 chip and hance you might get 
                disconnected from the app. Are you sure you want to proceed?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
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
            emitPartialEvent<Ldo>('onLdoUpdate', index, {
                voltage,
            });

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
                emitPartialEvent<Ldo>('onLdoUpdate', index, {
                    enabled,
                });
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
                    emitPartialEvent<Ldo>('onLdoUpdate', index, {
                        mode,
                    });
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

        if (pmicState !== 'ek-disconnected' && mode === 'LDO') {
            const ldo1Message =
                'Please ensure correct nPM1300-EK configuration before enabling LDO1. Connect LDO bypass capacitors by connecting the LDO1 jumper on P16. Disconnect VOUT1-LSIN1 and HIGH-LSOUT1 jumpers on P15. Ensure IN1, on P8, is connected to a source that is between 2.6V and 5.5V, for example Vsys.';
            const ldo2Message =
                'Please ensure correct nPM1300-EK configuration before enabling LDO2. Connect LDO bypass capacitors by connecting the LDO2 jumper on P16. Disconnect VOUT2-LSIN2 and LOW-LSOUT2 jumpers on P15. Ensure IN2, on P8, is connected to a source that is between 2.6V and 5.5V, for example Vsys.';
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic1300-setLdoMode-${index}`,
                    message: index === 0 ? ldo1Message : ldo2Message,
                    confirmLabel: 'Ok',
                    optionalLabel: "Ok, Don't ask again",
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        pmicChargingState: (index: number) =>
            sendCommand('npmx charger status get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerVTerm: (index: number) =>
            sendCommand('npmx charger termination_voltage normal get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerIChg: (index: number) =>
            sendCommand('npmx charger charger_current get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerEnabled: (index: number) =>
            sendCommand('npmx charger module charger get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerVTrickleFast: (index: number) =>
            sendCommand('npmx charger trickle get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerITerm: (index: number) =>
            sendCommand('npmx charger termination_current get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerEnabledRecharging: (index: number) =>
            sendCommand('npmx charger module recharge get'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerNTCThermistor: (index: number) =>
            sendCommand('npmx adc ntc get'),

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
            releaseAll.forEach(release => release());
        },
        applyConfig: config => {
            if (config.deviceType !== 'npm1300') {
                return;
            }

            const action = () => {
                config.chargers.forEach((charger, index) => {
                    setChargerVTerm(index, charger.vTerm);
                    setChargerIChg(index, charger.iChg);
                    setChargerEnabled(index, charger.enabled);
                    setChargerITerm(index, charger.iTerm);
                    setChargerEnabledRecharging(
                        index,
                        charger.enableRecharging
                    );
                    setChargerVTrickleFast(index, charger.vTrickleFast);
                    setChargerNTCThermistor(index, charger.ntcThermistor);
                });

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

            if (config.firmwareVersion !== baseDevice.getSupportedVersion()) {
                const warningDialog: PmicDialog = {
                    doNotAskAgainStoreID: 'pmic1300-load-config-mismatch',
                    message: `The configuration was intended for firmware version ${
                        config.firmwareVersion
                    }. Device is running a different version. 
                    ${baseDevice.getSupportedVersion()}. Do you still want to apply this configuration?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
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
