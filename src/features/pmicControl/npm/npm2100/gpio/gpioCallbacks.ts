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
    GPIOState2100,
    GPIOStateKeys,
    GPIOStateValues,
} from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    i: number
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 gpio mode',
                    true,
                    i,
                    toValueRegex(GPIOModeValues)
                ),
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

                        const isOutput = mode === GPIOMode2100.Output;
                        const isInterrupt =
                            mode ===
                                GPIOMode2100['Interrupt output, active high'] ||
                            mode ===
                                GPIOMode2100['Interrupt output, active low'];

                        eventEmitter.emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                mode,
                                driveEnabled: !isInterrupt,
                                openDrainEnabled: isOutput,
                                pullEnabled: !isInterrupt,
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
                    'npm2100 gpio state',
                    true,
                    i,
                    toValueRegex(GPIOStateValues)
                ),
                res => {
                    const valueIndex = GPIOStateValues.findIndex(
                        v => v === parseColonBasedAnswer(res)
                    );

                    if (valueIndex !== -1) {
                        const state: GPIOState2100 =
                            GPIOState2100[
                                GPIOStateKeys[
                                    valueIndex
                                ] as keyof typeof GPIOState2100
                            ];
                        eventEmitter.emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                state,
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
                    'npm2100 gpio pull',
                    true,
                    i,
                    toValueRegex(GPIOPullValues)
                ),
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
    }

    return cleanupCallbacks;
};
