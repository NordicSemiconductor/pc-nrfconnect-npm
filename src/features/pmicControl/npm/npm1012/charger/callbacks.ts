/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    onOffRegex,
    parseOnOff,
    parseToFloat,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { Charger } from '../../types';
import { advancedChargingProfileOnUpdate } from './helpers';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 charger recharge',
                    true,
                    undefined,
                    onOffRegex,
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        enableRecharging: parseOnOff(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 charger state', true, undefined, '(\\w+)'),
                () => {}, // TODO: Update
                noop,
            ),
        );

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 charger ntc cold',
                    true,
                    undefined,
                    '-?[0-9]+',
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tCold: parseToNumber(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 charger ntc cool',
                    true,
                    undefined,
                    '-?[0-9]+',
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tCool: parseToNumber(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 charger ntc warm',
                    true,
                    undefined,
                    '-?[0-9]+',
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        tWarm: parseToNumber(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm1012 charger throttling',
                    true,
                    undefined,
                    onOffRegex,
                ),
                res => {
                    eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                        enableChargeCurrentThrottling: parseOnOff(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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

        cleanupCallbacks.push(
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
    }

    return cleanupCallbacks;
};
