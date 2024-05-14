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
import { GPIOValues, Ldo, SoftStart } from '../../types';

const setupSingleLdo = (
    shellParser: ShellParser,
    eventEmitter: NpmEventEmitter,
    i: number
) => {
    const cleanupCallbacks = [];

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw status', true, i),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw mode', true, i),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        mode: parseToNumber(res) === 0 ? 'ldoSwitch' : 'LDO',
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw ldo_voltage', true, i),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw soft_start enable', true, i, '(0|1)'),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw soft_start current', true, i, '(10|20|35|50)'),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw active_discharge', true, i),
            res => {
                eventEmitter.emitPartialEvent<Ldo>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx ldsw gpio index', true, i, '(-1|[0-4])'),
            res => {
                const result = parseToNumber(res);
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        onOffControl: result === -1 ? 'SW' : GPIOValues[result],
                        onOffSoftwareControlEnabled: result === -1, // Disable on GPIO control, enable on SW control
                    },
                    i
                );
            },
            noop
        )
    );

    return cleanupCallbacks;
};

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    noOfLdos: number
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        for (let i = 0; i < noOfLdos; i += 1) {
            cleanupCallbacks.push(
                ...setupSingleLdo(shellParser, eventEmitter, i)
            );
        }
    }

    return cleanupCallbacks;
};
