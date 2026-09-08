/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseLogData,
    parseOnOff,
    parseToFloat,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import {
    type Charger,
    type LowPowerConfig,
    type PmicChargingState,
} from '../../types';
import { advancedChargingProfileOnUpdate } from './helpers';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    if (shellParser === undefined) {
        return [];
    }

    const callbacks = [];

    callbacks.push(
        shellParser.onShellLoggingEvent(logEvent => {
            parseLogData(logEvent, loggingEvent => {
                if (loggingEvent.module !== 'module_pmic_charger') {
                    return;
                }

                const messageParts = loggingEvent.message.split('=');
                const value = Number.parseInt(messageParts[1], 10);

                const chargingState: Partial<PmicChargingState> = {
                    // // eslint-disable-next-line no-bitwise
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
                };

                eventEmitter.emitPartialEvent<PmicChargingState>(
                    'onChargingStatusUpdate',
                    chargingState,
                );

                if (chargingState.batteryFull) {
                    eventEmitter.emitPartialEvent<LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            vbusHibernateWaitingForChargeComplete: false,
                            vbusStandbyWaitingForChargeComplete: false,
                        },
                    );
                }
            });
        }),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage termination', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTerm: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current charge', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChg: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger recharge', true, undefined, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableRecharging: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger lowbat_charging',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableVBatLow: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger enable', true, undefined, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enabled: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger state get', false, undefined, '(\\w+)'),
            res => {
                const messageParts = parseColonBasedAnswer(res).split(',');

                const chargingState: PmicChargingState = {
                    batteryFull: false,
                    trickleCharge: false,
                    constantCurrentCharging: false,
                    constantVoltageCharging: false,
                    batteryRechargeNeeded: false,
                    dieTempHigh: false,
                    supplementModeActive: false,
                };

                // TODO: Incomplete: add parsing for all possible values
                messageParts.forEach(part => {
                    switch (part) {
                        case 'Completed':
                            chargingState.batteryFull = true;
                            break;
                        case 'ConstantCurrent':
                            chargingState.constantCurrentCharging = true;
                            break;
                        case 'ConstantVoltage':
                            chargingState.constantVoltageCharging = true;
                            break;
                        case 'Trickle':
                            chargingState.trickleCharge = true;
                            break;
                    }
                });

                eventEmitter.emit('onChargingStatusUpdate', chargingState);
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage trickle', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTrickleFast: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current termination', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iTerm: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger dietemp reduce', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgReduce: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger dietemp resume', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgResume: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger dietemp status',
                true,
                undefined,
                '(\\w+)',
            ),
            () => {}, // TODO: Update
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger ntc cold', true, undefined, '-?[0-9]+'),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCold: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger ntc cool', true, undefined, '-?[0-9]+'),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCool: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger ntc warm', true, undefined, '-?[0-9]+'),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tWarm: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger ntc hot', true, undefined, '-?[0-9]+'),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tHot: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current trickle', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iTrickle: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage weak', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vWeak: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger jeita_charging',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                const enabled = parseOnOff(res);
                eventEmitter.emitPartialEvent<Charger>(
                    'onChargerUpdate',
                    advancedChargingProfileOnUpdate(enabled),
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger ntc monitoring',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableNtcMonitoring: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger weakbat_charging',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableWeakBatteryCharging: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current charge_cool', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChgCool: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current charge_warm', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChgWarm: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage termination_cool', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermCool: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage termination_warm', true),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermWarm: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 charger discharge_limit',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                const value = parseOnOff(res);
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableBatteryDischargeCurrentLimit: value,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger throttling', true, undefined, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableChargeCurrentThrottling: parseOnOff(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger current throttle', true, undefined),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iThrottle: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger timeout charging', true, undefined),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tOutCharge: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger timeout trickle', true, undefined),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tOutTrickle: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage throttle', true, undefined),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vThrottle: parseToNumber(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 charger voltage batlow', true, undefined),
            res => {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vBatLow: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    return callbacks;
};
