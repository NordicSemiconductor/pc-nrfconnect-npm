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
    MAX_TIMESTAMP,
    noop,
    parseBatteryModel,
    parseColonBasedAnswer,
    parseToBoolean,
    parseToNumber,
    toRegex,
} from './pmicHelpers';
import {
    AdcSample,
    BatteryModel,
    Buck,
    BuckMode,
    BuckModeControl,
    BuckOnOffControl,
    BuckRetentionControl,
    Charger,
    INpmDevice,
    IrqEvent,
    ITerm,
    Ldo,
    LdoMode,
    LoggingEvent,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    ProfileDownload,
    VTrickleFast,
} from './types';

const parseTime = (timeString: string) => {
    const time = timeString.trim().split(',')[0].replace('.', ':').split(':');
    const msec = Number(time[3]);
    const sec = Number(time[2]) * 1000;
    const min = Number(time[1]) * 1000 * 60;
    const hr = Number(time[0]) * 1000 * 60 * 60;

    return msec + sec + min + hr;
};

const parseLogData = (
    logMessage: string,
    callback: (loggingEvent: LoggingEvent) => void
) => {
    const endOfTimestamp = logMessage.indexOf(']');

    const strTimeStamp = logMessage.substring(1, endOfTimestamp);

    const endOfLogLevel = logMessage.indexOf('>');

    const logLevel = logMessage.substring(
        logMessage.indexOf('<') + 1,
        endOfLogLevel
    );
    const module = logMessage.substring(
        endOfLogLevel + 2,
        logMessage.indexOf(':', endOfLogLevel)
    );
    const message = logMessage
        .substring(logMessage.indexOf(':', endOfLogLevel) + 2)
        .trim();

    callback({ timestamp: parseTime(strTimeStamp), logLevel, module, message });
};

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
        '0.0.0+14'
    );
    const batteryProfiler = shellParser
        ? BatteryProfiler(shellParser, eventEmitter)
        : undefined;
    let lastUptime = 0;
    let profileDownloadInProgress = false;
    let profileDownloadAborting = false;

    // can only change from:
    //  - 'pmic-unknown' --> 'pmic-connected' --> 'pmic-disconnected'
    //  - 'ek-disconnected'
    let pmicState: PmicState = shellParser ? 'pmic-unknown' : 'ek-disconnected';

    let pmicStateUnknownTimeout: NodeJS.Timeout | undefined;

    const initConnectionTimeout = () => {
        clearConnectionTimeout();
        if (pmicState === 'ek-disconnected') return;
        pmicStateUnknownTimeout = setTimeout(() => {
            pmicState = 'pmic-connected';
            eventEmitter.emit('onPmicStateChange', pmicState);
        }, 2000);
    };

    const clearConnectionTimeout = () => {
        if (pmicStateUnknownTimeout) {
            clearTimeout(pmicStateUnknownTimeout);
            pmicStateUnknownTimeout = undefined;
        }
    };

    const processModulePmic = ({ message }: LoggingEvent) => {
        switch (message) {
            case 'No response from PMIC.':
                clearConnectionTimeout();
                if (pmicState !== 'pmic-disconnected') {
                    pmicState = 'pmic-disconnected';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                }
                break;
            case 'PMIC available. Application can be restarted.':
                baseDevice.kernelReset();
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
        messageParts.forEach(part => {
            const pair = part.split('=');
            switch (pair[0]) {
                case 'vbat':
                    adcSample.vBat = Number(pair[1] ?? 0);
                    break;
                case 'ibat':
                    adcSample.iBat = Number(pair[1] ?? 0) * 1000;
                    break;
                case 'tbat':
                    adcSample.tBat = Number(pair[1] ?? 0);
                    break;
                case 'soc':
                    adcSample.soc = Number(pair[1] ?? NaN);
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

    const startAdcSample = (samplingRate: number) => {
        sendCommand(`npm_adc sample 1000 ${samplingRate}`);
    };

    const stopAdcSample = () => {
        startAdcSample(0);
    };

    shellParser?.onShellLoggingEvent(logEvent => {
        parseLogData(logEvent, loggingEvent => {
            let dataPair = false;
            switch (loggingEvent.module) {
                case 'module_pmic':
                    processModulePmic(loggingEvent);
                    break;
                case 'module_pmic_adc':
                    processModulePmicAdc(loggingEvent);
                    dataPair = true;
                    break;
                case 'module_pmic_irq':
                    processModulePmicIrq(loggingEvent);
                    dataPair = true;
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
                dataPair,
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

    // TODO Add callback clean up
    shellParser?.registerCommandCallback(
        toRegex('npmx charger termination_voltage normal', true),
        res => {
            const value = parseToNumber(res);
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                vTerm: value / 1000, // mv to V
            });
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger charger_current', true),
        res => {
            const value = parseToNumber(res);
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                iChg: value,
            });
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger status', true),
        res => {
            const value = parseToNumber(res);
            emitOnChargingStatusUpdate(value);
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger module charger', true, undefined, '(1|0)'),
        res => {
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                enabled: parseToBoolean(res),
            });
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge', true, undefined, '(1|0)'),

        res => {
            eventEmitter.emit('onFuelGauge', parseToBoolean(res));
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model download begin'),
        () => shellParser?.setShellEchos(false),
        () => shellParser?.setShellEchos(true)
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model download apply'),
        res => {
            if (profileDownloadInProgress) {
                profileDownloadInProgress = false;
                const profileDownload: ProfileDownload = {
                    state: 'applied',
                    alertMessage: parseColonBasedAnswer(res),
                };
                eventEmitter.emit('onProfileDownloadUpdate', profileDownload);
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
                eventEmitter.emit('onProfileDownloadUpdate', profileDownload);
            }
            shellParser?.setShellEchos(true);
        }
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model download abort'),
        res => {
            if (profileDownloadInProgress) {
                profileDownloadInProgress = false;
                const profileDownload: ProfileDownload = {
                    state: 'aborted',
                    alertMessage: parseColonBasedAnswer(res),
                };
                eventEmitter.emit('onProfileDownloadUpdate', profileDownload);
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
                eventEmitter.emit('onProfileDownloadUpdate', profileDownload);
            }

            shellParser?.setShellEchos(true);
        }
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model', true, undefined, '[A-Za-z0-9]+'),
        res => {
            eventEmitter.emit(
                'onActiveBatteryModelUpdate',
                parseBatteryModel(parseColonBasedAnswer(res))
            );
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model store'),
        () => {
            requestUpdate.storedBatteryModel();
            requestUpdate.activeBatteryModel();
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge model list'),
        res => {
            const models = res.split('Battery model stored in database:');
            if (models.length < 2) {
                eventEmitter.emit('onStoredBatteryModelUpdate', undefined);
                return;
            }
            const stringModels = models[1].trim().split('\r\n');
            const list = stringModels.map(parseBatteryModel);
            eventEmitter.emit(
                'onStoredBatteryModelUpdate',
                list.length !== 0 ? list[0] : undefined
            );
        },
        noop
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx vbusin vbus status get'),
        res => {
            eventEmitter.emit('onUsbPowered', parseToBoolean(res));
        },
        noop
    );

    for (let i = 0; i < devices.noOfBucks; i += 1) {
        shellParser?.registerCommandCallback(
            toRegex('npmx buck voltage', true, i),
            res => {
                const value = parseToNumber(res);
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    vOut: value / 1000, // mV to V
                });
            },
            noop
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx buck vout select', true, i),
            res => {
                const value = parseToNumber(res);
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    mode: value === 0 ? 'vSet' : 'software',
                });
            },
            noop
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx buck', true, i),
            res => {
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    enabled: parseToBoolean(res),
                });
            },
            noop
        );
    }

    for (let i = 0; i < devices.noOfLdos; i += 1) {
        shellParser?.registerCommandCallback(
            toRegex('npmx ldsw', true, i),
            res => {
                emitPartialEvent<Ldo>('onLdoUpdate', i, {
                    enabled: parseToBoolean(res),
                });
            },
            noop
        );
    }

    const sendCommand = (
        command: string,
        onSuccess: (response: string, command: string) => void = noop,
        onFail: (response: string, command: string) => void = noop,
        unique = true
    ) => {
        if (pmicState !== 'ek-disconnected') {
            shellParser?.enqueueRequest(
                command,
                onSuccess,
                onFail,
                console.warn,
                unique
            );
        } else {
            onFail('No Shell connection', command);
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
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            emitPartialEvent<Charger>('onChargerUpdate', index, {
                vTrickleFast: value,
            });

            resolve();
        });

    const setChargerITerm = (index: number, iTerm: ITerm) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            emitPartialEvent<Charger>('onChargerUpdate', index, {
                iTerm,
            });

            resolve();
        });

    const setChargerEnabledRecharging = (index: number, enabled: boolean) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            emitPartialEvent<Charger>('onChargerUpdate', index, {
                enableRecharging: enabled,
            });

            resolve();
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
                    () => resolve(),
                    () => {
                        requestUpdate.chargerEnabled(index);
                        reject();
                    }
                );
            }
        });

    const setBuckVOut = (index: number, value: number) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (pmicState === 'ek-disconnected') {
                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        vOut: value,
                    });

                    emitPartialEvent<Buck>('onBuckUpdate', index, {
                        mode: 'software',
                    });

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck voltage set ${index} ${value * 1000}`,
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
                            requestUpdate.buckVOut(index);
                            reject();
                        }
                    );
                }
            });

        if (pmicState !== 'ek-disconnected' && index === 0 && value <= 1.7) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                    message: `Buck 1 Powers the I2C communications that are needed for this app. 
                    Any voltage lower that 1.7v Might cause issues with the Connection to the app. Are you sure you want to continue`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: () => {
                        requestUpdate.buckVOut(index);
                        resolve();
                    },
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setBuckRetentionVOut = (index: number, value: number) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            if (pmicState === 'ek-disconnected')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    retentionVOut: value,
                });

            resolve();
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
                            requestUpdate.buckVOut(index);
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
            index === 0 &&
            mode === 'software'
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                    message: `Buck 1 Powers the I2C communications that are needed for this app. 
                    Software voltage might be already set to less then 1.7V . Are you sure you want to continue`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: () => {
                        requestUpdate.buckVOut(index);
                        resolve();
                    },
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setBuckModeControl = (index: number, modeControl: BuckModeControl) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            if (pmicState === 'ek-disconnected')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    modeControl,
                });

            resolve();
        });

    const setBuckOnOffControl = (
        index: number,
        onOffControl: BuckOnOffControl
    ) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            if (pmicState === 'ek-disconnected')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    onOffControl,
                });

            resolve();
        });

    const setBuckRetentionControl = (
        index: number,
        retentionControl: BuckRetentionControl
    ) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            if (pmicState === 'ek-disconnected')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    retentionControl,
                });

            resolve();
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

        if (pmicState !== 'ek-disconnected' && index === 0 && !enabled) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckEnabled-0',
                    message: `Disabling the buck 1 might effect I2C communications to the PMIC 1300 chip and hance you might get 
                disconnected from the app. Are you sure you want to proceed?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, Don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: resolve,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

    const setLdoVoltage = (index: number, voltage: number) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');
            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>('onLdoUpdate', index, {
                    voltage,
                });
            }
            resolve();
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
    const setLdoMode = (index: number, mode: LdoMode) =>
        new Promise<void>(resolve => {
            console.warn('Not implemented');

            if (pmicState === 'ek-disconnected') {
                emitPartialEvent<Ldo>('onLdoUpdate', index, {
                    mode,
                });
            }
            resolve();
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

    const downloadFuelGaugeProfile = (profile: Buffer) => {
        const chunkSize = 256;
        const chunks = Math.ceil(profile.byteLength / chunkSize);

        return new Promise<void>((resolve, reject) => {
            const downloadData = (chunk = 0) => {
                sendCommand(
                    `fuel_gauge model download "${profile.subarray(
                        chunk * chunkSize,
                        (chunk + 1) * chunkSize
                    )}"`,
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
                `fuel_gauge model download apply`,
                () => {
                    resolve();
                },
                () => reject()
            );
        });

    const setActiveBatteryModel = (name: string) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model set ${name}`,
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

    const storeBattery = () =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model store`,
                () => resolve(),
                () => reject()
            );
        });

    initConnectionTimeout();

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
        chargerVTrickleFast: (index: number) => console.warn('Not implemented'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerITerm: (index: number) => console.warn('Not implemented'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        chargerEnabledRecharging: (index: number) =>
            console.warn('Not implemented'),

        buckVOut: (index: number) =>
            sendCommand(`npmx buck voltage get ${index}`),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckRetentionVOut: (index: number) => console.warn('Not implemented'),
        buckMode: (index: number) =>
            sendCommand(`npmx buck vout select get ${index}`),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckModeControl: (index: number) => console.warn('Not implemented'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckOnOffControl: (index: number) => console.warn('Not implemented'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckRetentionControl: (index: number) =>
            console.warn('Not implemented'),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        buckEnabled: (index: number) => console.warn('Not implemented'),

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ldoVoltage: (index: number) => console.warn('Not implemented'),
        ldoEnabled: (index: number) => sendCommand(`npmx ldsw get ${index}`),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ldoMode: (index: number) => console.warn('Not implemented'),

        fuelGauge: () => sendCommand('fuel_gauge get'),
        activeBatteryModel: () => sendCommand(`fuel_gauge model get`),
        storedBatteryModel: () => sendCommand(`fuel_gauge model list`),

        usbPowered: () => sendCommand(`npmx vbusin vbus status get`),
    };

    return {
        ...baseDevice,
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
                });

                config.bucks.forEach((buck, index) => {
                    setBuckVOut(index, buck.vOut);
                    setBuckMode(index, buck.mode);
                    setBuckEnabled(index, buck.enabled);
                    setBuckModeControl(index, buck.modeControl);
                    setBuckRetentionVOut(index, buck.retentionVOut);
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
        setBuckVOut,
        setBuckRetentionVOut,
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
        storeBattery,

        getDefaultBatteryModels: () =>
            new Promise<BatteryModel[]>((resolve, reject) => {
                shellParser?.enqueueRequest(
                    'fuel_gauge model list',
                    result => {
                        const models = result.split(':');
                        if (models.length < 3) reject();
                        const stringModels = models[2].trim().split('\n');
                        const list = stringModels.map(parseBatteryModel);
                        resolve(list.filter(item => item.name !== ''));
                    },
                    reject,
                    console.warn,
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
    };
};
