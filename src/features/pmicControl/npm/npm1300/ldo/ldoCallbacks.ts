/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { GPIOValues, Ldo, Npm1300LoadSwitchSoftStart } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    index: number
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw status', true, index),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            enabled: parseToBoolean(res),
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw mode', true, index),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode:
                                parseToNumber(res) === 0
                                    ? 'Load_switch'
                                    : 'LDO',
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw ldo_voltage', true, index),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            voltage: parseToNumber(res) / 1000, // mV to V
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw soft_start enable', true, index, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            softStartEnabled: parseToBoolean(res),
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx ldsw soft_start current',
                    true,
                    index,
                    '(10|20|35|50)'
                ),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            softStart: parseToNumber(
                                res
                            ) as Npm1300LoadSwitchSoftStart,
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw active_discharge', true, index),
                res => {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            activeDischarge: parseToBoolean(res),
                        },
                        index
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ldsw gpio index', true, index, '(-1|[0-4])'),
                res => {
                    const result = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            onOffControl:
                                result === -1 ? 'SW' : GPIOValues[result],
                            onOffSoftwareControlEnabled: result === -1, // Disable on GPIO control, enable on SW control
                        },
                        index
                    );
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
