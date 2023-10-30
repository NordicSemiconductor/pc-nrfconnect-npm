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
import { GPIO, GPIODrive, GPIOModeValues, GPIOPullValues } from '../../types';

const setupSingleGpio = (
    shellParser: ShellParser,
    eventEmitter: NpmEventEmitter,
    i: number
) => {
    const cleanupCallbacks = [];

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx gpio config mode', true, i, '[0-9]'),
            res => {
                const mode = GPIOModeValues[parseToNumber(res)];
                if (mode) {
                    eventEmitter.emitPartialEvent<GPIO>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx gpio config pull', true, i, '(0|1|2)'),
            res => {
                const pull = GPIOPullValues[parseToNumber(res)];
                if (pull) {
                    eventEmitter.emitPartialEvent<GPIO>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx gpio config drive', true, i, '(1|6)'),
            res => {
                eventEmitter.emitPartialEvent<GPIO>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx gpio config open_drain', true, i, '(0|1)'),
            res => {
                eventEmitter.emitPartialEvent<GPIO>(
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

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx gpio config debounce', true, i, '(0|1)'),
            res => {
                eventEmitter.emitPartialEvent<GPIO>(
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
                ...setupSingleGpio(shellParser, eventEmitter, i)
            );
        }
    }

    return cleanupCallbacks;
};
