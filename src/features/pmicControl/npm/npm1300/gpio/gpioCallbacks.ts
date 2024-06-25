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
    toValueRegex,
} from '../../pmicHelpers';
import { GPIO } from '../../types';
import {
    GPIODrive1300,
    GPIODriveValues,
    GPIOMode1300,
    GPIOModeValues,
    GPIOPull1300,
    GPIOPullValues,
} from './types';

const setupSingleGpio = (
    shellParser: ShellParser,
    eventEmitter: NpmEventEmitter,
    i: number
) => {
    const cleanupCallbacks = [];

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npmx gpio config mode',
                true,
                i,
                toValueRegex(GPIOModeValues)
            ),
            res => {
                const mode: GPIOMode1300 = parseToNumber(res);
                if (mode >= 0 && mode < GPIOModeValues.length) {
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
            toRegex(
                'npmx gpio config pull',
                true,
                i,
                toValueRegex(GPIOPullValues)
            ),
            res => {
                const pull: GPIOPull1300 = parseToNumber(res);
                if (pull >= 0 && pull < GPIOPullValues.length) {
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
            toRegex(
                'npmx gpio config drive',
                true,
                i,
                toValueRegex(GPIODriveValues)
            ),
            res => {
                const drive: GPIODrive1300 = parseToNumber(res);
                if (GPIODriveValues.findIndex(v => v === drive) !== -1) {
                    eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            drive: parseToNumber(res),
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
    noOfGpios: number
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        for (let i = 0; i < noOfGpios; i += 1) {
            cleanupCallbacks.push(
                ...setupSingleGpio(shellParser, eventEmitter, i)
            );
        }
    }

    return cleanupCallbacks;
};
