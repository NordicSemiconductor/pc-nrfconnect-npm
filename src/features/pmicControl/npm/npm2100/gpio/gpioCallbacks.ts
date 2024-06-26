/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseOnOff,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { GPIO } from '../../types';
import {
    GPIODrive2100,
    GPIODriveKeys,
    GPIODriveValues,
    GPIOMode2100,
    GPIOModeKeys,
    GPIOModeValues,
    GPIOPull2100,
    GPIOPullKeys,
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
            toRegex('npm2100 gpio mode', true, i, toValueRegex(GPIOModeValues)),
            res => {
                const valueIndex = GPIOModeValues.findIndex(
                    v => v === parseColonBasedAnswer(res)
                );

                if (valueIndex !== -1) {
                    const mode: GPIOMode2100 =
                        GPIOMode2100[
                            GPIOModeKeys[
                                valueIndex
                            ] as keyof typeof GPIOMode2100
                        ];
                    const isInput =
                        GPIOModeKeys[valueIndex].startsWith('Input');

                    eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            mode,
                            driveEnabled: !isInput,
                            openDrainEnabled: !isInput,
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
            toRegex('npm2100 gpio pull', true, i, toValueRegex(GPIOPullValues)),
            res => {
                const valueIndex = GPIOPullValues.findIndex(
                    v => v === parseColonBasedAnswer(res)
                );

                if (valueIndex !== -1) {
                    const pull: GPIOPull2100 =
                        GPIOPull2100[
                            GPIOPullKeys[
                                valueIndex
                            ] as keyof typeof GPIOPull2100
                        ];
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
                'npm2100 gpio drive',
                true,
                i,
                toValueRegex(GPIODriveValues)
            ),
            res => {
                const valueIndex = GPIODriveValues.findIndex(
                    v => v === parseColonBasedAnswer(res)
                );

                if (valueIndex !== -1) {
                    const drive: GPIODrive2100 =
                        GPIODrive2100[
                            GPIODriveKeys[
                                valueIndex
                            ] as keyof typeof GPIODrive2100
                        ];
                    eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            drive,
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
            toRegex('npm2100 gpio opendrain', true, i, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        openDrain: parseOnOff(res),
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm2100 gpio debounce', true, i, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        debounce: parseOnOff(res),
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
