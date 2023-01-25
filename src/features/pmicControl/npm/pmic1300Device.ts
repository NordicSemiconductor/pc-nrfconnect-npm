/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { getRange } from '../../../utils/helpers';
import { baseNpmDevice, IBaseNpmDevice } from './basePmicDevice';
import {
    AdcSample,
    Buck,
    BuckMode,
    Charger,
    Ldo,
    LdoMode,
    NpmDevice,
    PartialUpdate,
    PmicChargingState,
    PmicState,
    PmicWarningDialog,
} from './types';

const maxTimeStamp = 359999999; // 99hrs 59min 59sec 999ms

const parseOnSuccess = (message: string) => message.split(':')[1]?.trim();

const parseToNumber = (message: string) =>
    Number.parseInt(parseOnSuccess(message), 10);

const toRegex = (
    command: string,
    getSet?: boolean,
    index?: number,
    valueRegex = '[0-9]+'
) => {
    const indexRegex = index !== undefined ? ` ${index}` : '';
    if (getSet)
        command += ` (set${indexRegex} ${valueRegex}( [^\\s-]+)?|get${indexRegex})`;
    else if (index !== undefined) command += indexRegex;

    command = command.replaceAll(' ', '([^\\S\\r\\n])+');
    return `${command}`;
};

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
    callback: (
        timestamp: number,
        logLevel: string,
        module: string,
        message: string
    ) => void
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
    const message = logMessage.substring(
        logMessage.indexOf(':', endOfLogLevel) + 2
    );

    callback(parseTime(strTimeStamp), logLevel, module, message);
};

interface INpmDevice extends IBaseNpmDevice {
    (
        shellParser: ShellParser | undefined,
        warningDialogHandler: (pmicWarningDialog: PmicWarningDialog) => void
    ): NpmDevice;
}

export const getNPM1300: INpmDevice = (shellParser, warningDialogHandler) => {
    const eventEmitter = new EventEmitter();
    const devices = {
        noOfBucks: 2,
        noOfChargers: 1,
        noOfLdos: 2,
    };
    const baseDevice = baseNpmDevice(
        shellParser,
        warningDialogHandler,
        eventEmitter,
        devices,
        '0.0.0+1'
    );
    let lastUptime = 0;
    let initUptime = -1;
    let uptimeOverflowCounter = 0;

    // can only change from:
    //  - 'disconnected' --> 'connected' --> 'disconnected'
    //  - 'offline'
    let pmicState: PmicState = shellParser ? 'disconnected' : 'offline';

    let pmicStateUnknownTimeout: NodeJS.Timeout | undefined;

    const initConnectionTimeout = () => {
        clearConnectionTimeout();
        if (pmicState === 'offline') return;
        pmicStateUnknownTimeout = setTimeout(() => {
            pmicState = 'connected';
            eventEmitter.emit('onPmicStateChange', pmicState);
        }, 2000);
    };

    const clearConnectionTimeout = () => {
        if (pmicStateUnknownTimeout) {
            clearTimeout(pmicStateUnknownTimeout);
            pmicStateUnknownTimeout = undefined;
        }
    };

    const processModulePmic = (
        timestamp: number,
        logLevel: string,
        module: string,
        message: string
    ) => {
        switch (message) {
            case 'No response from PMIC.':
                clearConnectionTimeout();
                if (pmicState !== 'disconnected') {
                    pmicState = 'disconnected';
                    eventEmitter.emit('onPmicStateChange', pmicState);
                }
                break;
            case 'PMIC available. Application can be restarted.':
                baseDevice.kernelReset('cold');
                break;
        }
    };

    const processModulePmicAdc = (
        timestamp: number,
        logLevel: string,
        module: string,
        message: string
    ) => {
        const messageParts = message.split(',');
        const adcSample: AdcSample = {
            timestamp,
            vBat: 0,
            iBat: 0,
            tBat: 0,
            soc: undefined,
        };
        messageParts.forEach(part => {
            const pair = part.split('=');
            switch (pair[0]) {
                case 'vbat':
                    adcSample.vBat = Number(pair[1]);
                    break;
                case 'ibat':
                    adcSample.iBat = Number(pair[1]);
                    break;
                case 'tbat':
                    adcSample.tBat = Number(pair[1]);
                    break;
                case 'soc':
                    adcSample.soc = Number(pair[1]);
                    break;
            }
        });

        if (adcSample.timestamp < lastUptime) {
            uptimeOverflowCounter += 1;
            adcSample.timestamp += maxTimeStamp * (uptimeOverflowCounter + 1);
        }
        if (adcSample.timestamp !== lastUptime) {
            lastUptime = adcSample.timestamp;
        }
        if (initUptime < 0) {
            initUptime = adcSample.timestamp;
            adcSample.timestamp = 0;
        } else {
            adcSample.timestamp -= initUptime;
        }

        eventEmitter.emit('onAdcSample', adcSample);
    };

    const startAdcSample = (samplingRate: number) => {
        sendCommand(`npm_adc_sample ${samplingRate}`);
    };

    const stopAdcSample = () => {
        startAdcSample(0);
    };

    shellParser?.onShellLoggingEvent(logEvent => {
        parseLogData(logEvent, (timestamp, logLevel, module, message) => {
            switch (module) {
                case 'module_pmic':
                    processModulePmic(timestamp, logLevel, module, message);
                    break;
                case 'module_pmic_adc':
                    processModulePmicAdc(timestamp, logLevel, module, message);
                    break;
                default:
                    console.warn(
                        'Unknown Module message: ',
                        timestamp,
                        logLevel,
                        module,
                        message
                    );
                    break;
            }
        });
    });

    const emitPartialEvent = <T>(
        eventName: string,
        index: number,
        data: Partial<T>
    ) => {
        eventEmitter.emit(eventName, {
            index,
            data,
        } as PartialUpdate<T>);
    };

    shellParser?.registerCommandCallback(
        toRegex('npmx charger termination_voltage normal', true),
        res => {
            const value = parseToNumber(res);
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                vTerm: value / 1000, // mv to V
            });
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger charger_current', true),
        res => {
            const value = parseToNumber(res);
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                iChg: value,
            });
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger status', true),
        res => {
            const value = parseToNumber(res);
            eventEmitter.emit('onChargingStatusUpdate', {
                // batteryDetected: (value & 0x01) > 0,
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
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger module charger enable'),
        () => {
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                enabled: true,
            });
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('npmx charger module charger disable'),
        () => {
            emitPartialEvent<Charger>('onChargerUpdate', 0, {
                enabled: false,
            });
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge status'),
        res => {
            eventEmitter.emit(
                'onFuelGauge',
                res.match('state=ENABLED') !== null
            );
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge enable'),
        () => {
            eventEmitter.emit('onFuelGauge', true);
        },
        console.error
    );

    shellParser?.registerCommandCallback(
        toRegex('fuel_gauge disable'),
        () => {
            eventEmitter.emit('onFuelGauge', false);
        },
        console.error
    );

    for (let i = 0; i < devices.noOfBucks; i += 1) {
        shellParser?.registerCommandCallback(
            toRegex('npmx buck voltage normal', true, i),
            res => {
                const value = parseToNumber(res);
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    vOut: value / 1000, // mV to V
                });
            },
            console.error
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx buck vout select', true, i, '[0-1]'),
            res => {
                const valueString = parseOnSuccess(res);
                let mode: BuckMode | undefined;

                switch (valueString) {
                    case 'vset pin select':
                    case '0':
                        mode = 'vSet';
                        break;
                    case 'software select':
                    case '1':
                        mode = 'software';
                        break;
                }

                if (mode)
                    emitPartialEvent<Buck>('onBuckUpdate', i, {
                        mode,
                    });
            },
            console.error
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx buck enable', false, i),
            () => {
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    enabled: true,
                });
            },
            console.error
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx buck disable', false, i),
            () => {
                emitPartialEvent<Buck>('onBuckUpdate', i, {
                    enabled: false,
                });
            },
            console.error
        );
    }

    for (let i = 0; i < devices.noOfLdos; i += 1) {
        shellParser?.registerCommandCallback(
            toRegex('npmx ldsw enable', false, i),
            () => {
                emitPartialEvent<Ldo>('onLdoUpdate', i, {
                    enabled: true,
                });
            },
            console.error
        );

        shellParser?.registerCommandCallback(
            toRegex('npmx ldsw disable', false, i),
            () => {
                emitPartialEvent<Ldo>('onLdoUpdate', i, {
                    enabled: false,
                });
            },
            console.error
        );
    }

    const sendCommand = (
        command: string,
        onSuccess?: () => void,
        onFail?: () => void
    ) => {
        if (pmicState !== 'offline')
            shellParser?.enqueueRequest(command, onSuccess, onFail, true);
    };

    const setChargerVTerm = (index: number, value: number) => {
        sendCommand(
            `npmx charger termination_voltage normal set ${value * 1000}` // mv to V
        );

        if (pmicState === 'offline')
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                vTerm: value,
            });

        setChargerEnabled(index, false);
    };
    const setChargerIChg = (index: number, value: number) => {
        sendCommand(`npmx charger charger_current set ${value}`);

        if (pmicState === 'offline')
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                iChg: value,
            });

        setChargerEnabled(index, false);
    };
    const setChargerEnabled = (index: number, enabled: boolean) => {
        sendCommand(
            `npmx charger module charger ${enabled ? 'enable' : 'disable'} 1`
        );

        if (pmicState === 'offline')
            emitPartialEvent<Charger>('onChargerUpdate', index, {
                enabled,
            });

        requestUpdate.pmicChargingState();
    };

    const setBuckVOut = (index: number, value: number) => {
        const action = () => {
            sendCommand(
                `npmx buck voltage normal set ${index} ${value * 1000}`
            );

            if (pmicState === 'offline')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    vOut: value,
                });

            setBuckMode(index, 'software');
        };

        if (index === 0 && value <= 1.7) {
            const warningDialog: PmicWarningDialog = {
                message: `Buck 1 Powers the I2C communications that are needed for this app. 
                    Any voltage lower that 1.7v Might cause issues with the Connection to the app. Are you sure you want to continue`,
                confirmLabel: 'Yes',
                cancelLabel: 'No',
                title: 'Warning',
                onConfirm: action,
                onCancel: () => requestUpdate.buckVOut(index),
            };

            warningDialogHandler(warningDialog);
        } else {
            action();
        }
    };

    const setBuckMode = (index: number, mode: BuckMode) => {
        sendCommand(
            `npmx buck vout select set ${index} ${mode === 'software' ? 1 : 0}`
        );

        if (pmicState === 'offline')
            emitPartialEvent<Buck>('onBuckUpdate', index, {
                mode,
            });

        requestUpdate.buckVOut(index);
    };
    const setBuckEnabled = (index: number, enabled: boolean) => {
        const action = () => {
            sendCommand(`npmx buck ${enabled ? 'enable' : 'disable'} ${index}`);

            if (pmicState === 'offline')
                emitPartialEvent<Buck>('onBuckUpdate', index, {
                    enabled,
                });
        };

        if (index === 0 && !enabled) {
            const warningDialog: PmicWarningDialog = {
                message: `Disabling the buck 1 might effect I2C communications to the PMIC 1300 chip and hance you might get 
                disconnected from the app. Are you sure you want to proceed?`,
                confirmLabel: 'Yes',
                cancelLabel: 'No',
                title: 'Warning',
                onConfirm: action,
                onCancel: () => {},
            };

            warningDialogHandler(warningDialog);
        } else {
            action();
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const setLdoVoltage = (index: number, value: number) =>
        console.warn('Not implemented');
    const setLdoEnabled = (index: number, enabled: boolean) => {
        sendCommand(`npmx ldsw ${enabled ? 'enable' : 'disable'} ${index}`);

        if (pmicState === 'offline')
            emitPartialEvent<Ldo>('onLdoUpdate', index, {
                enabled,
            });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const setLdoMode = (index: number, mode: LdoMode) =>
        console.warn('Not implemented');

    const setFuelGaugeEnabled = (enabled: boolean) => {
        sendCommand(`fuel_gauge ${enabled ? 'enable' : 'disable'}`);

        if (pmicState === 'offline') eventEmitter.emit('onFuelGauge', enabled);
    };

    initConnectionTimeout();

    const requestUpdate = {
        pmicChargingState: () => sendCommand('npmx charger status get'),
        chargerVTerm: () =>
            sendCommand('npmx charger termination_voltage normal get'),
        chargerIChg: () => sendCommand('npmx charger charger_current get'),
        chargerEnabled: (index: number) =>
            sendCommand(`npmx buck voltage normal get ${index}`),

        buckVOut: (index: number) =>
            sendCommand(`npmx buck voltage normal get ${index}`),
        buckMode: (index: number) =>
            sendCommand(`npmx buck vout select get ${index}`),
        buckEnabled: () => console.warn('Not implemented'),

        ldoVoltage: () => console.warn('Not implemented'),
        ldoEnabled: () => console.warn('Not implemented'),
        ldoMode: () => console.warn('Not implemented'),

        fuelGauge: () => {
            sendCommand('fuel_gauge status');
        },
    };

    return {
        ...baseDevice,
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
        setBuckVOut,
        setBuckMode,
        setBuckEnabled,
        setLdoVoltage,
        setLdoEnabled,
        setLdoMode,

        setFuelGaugeEnabled,
    };
};
