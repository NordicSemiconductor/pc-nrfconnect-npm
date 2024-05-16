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
    parseToNumber,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import {
    Boost,
    BoostMode,
    BoostModeControl,
    BoostModeControlValues,
    BoostModeValues,
    BoostPinMode,
    BoostPinModeValues,
    BoostPinSelection,
    BoostPinSelectionValues,
} from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 boost vout', true),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            vOut: value / 1000, // mV to V
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 boost voutsel',
                    true,
                    undefined,
                    toValueRegex(BoostModeValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            mode: parseColonBasedAnswer(res) as BoostMode,
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 boost mode',
                    true,
                    undefined,
                    toValueRegex(BoostModeControlValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            modeControl: parseColonBasedAnswer(
                                res
                            ) as BoostModeControl,
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 boost pinsel',
                    true,
                    undefined,
                    toValueRegex(BoostPinSelectionValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            pinSelection: parseColonBasedAnswer(
                                res
                            ) as BoostPinSelection,
                            pinModeEnabled:
                                (parseColonBasedAnswer(
                                    res
                                ) as BoostPinSelection) !== 'OFF',
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 boost pinmode',
                    true,
                    undefined,
                    toValueRegex(BoostPinModeValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            pinMode: parseColonBasedAnswer(res) as BoostPinMode,
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 boost ocp', true, undefined, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            overCurrentProtection:
                                parseColonBasedAnswer(res) === 'ON',
                        },
                        0
                    );
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
