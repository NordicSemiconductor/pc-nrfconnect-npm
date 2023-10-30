/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseLogData,
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { Charger, NTCThermistor, PmicChargingState } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

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

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.onShellLoggingEvent(logEvent => {
                parseLogData(logEvent, loggingEvent => {
                    if (loggingEvent.module === 'module_pmic_charger') {
                        const messageParts = loggingEvent.message.split('=');
                        const value = Number.parseInt(messageParts[1], 10);
                        emitOnChargingStatusUpdate(value);
                    }
                });
            })
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger termination_voltage normal', true),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        vTerm: value / 1000, // mv to V
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger termination_voltage warm', true),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        vTermR: value / 1000, // mv to V
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger charging_current', true),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        iChg: value,
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger status all get', false),
                res => {
                    const value = parseToNumber(res);
                    emitOnChargingStatusUpdate(value);
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger module recharge',
                    true,
                    undefined,
                    '(1|0)'
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        enableRecharging: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger module charger',
                    true,
                    undefined,
                    '(1|0)'
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        enabled: parseToBoolean(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger trickle_voltage',
                    true,
                    undefined,
                    '(2500|2900)'
                ),
                res => {
                    const result = parseToNumber(res) / 1000;

                    if (result === 2.5 || result === 2.9) {
                        eventEmitter.emitPartialEvent<Charger>(
                            'onChargerUpdate',
                            {
                                vTrickleFast: result,
                            }
                        );
                    }
                },
                noop
            )
        );

        cleanupCallbacks.push(
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
                        eventEmitter.emitPartialEvent<Charger>(
                            'onChargerUpdate',
                            {
                                iTerm: `${result}%`,
                            }
                        );
                    }
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger die_temp stop', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tChgStop: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger die_temp resume', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tChgResume: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx charger ntc_temperature cold',
                    true,
                    undefined,
                    '-?[0-9]+'
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tCold: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature cool', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tCool: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature warm', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tWarm: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx charger ntc_temperature hot', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tHot: parseToNumber(res),
                    });
                },
                noop
            )
        );

        cleanupCallbacks.push(
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
                        eventEmitter.emitPartialEvent<Charger>(
                            'onChargerUpdate',
                            {
                                ntcThermistor: mode,
                            }
                        );
                    }
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx adc ntc beta', true),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        ntcBeta: parseToNumber(res),
                    });
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
