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
    parseToNumber,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import {
    Boost,
    BoostModeControl,
    BoostModeControlValues,
    BoostPinMode,
    BoostPinModeValues,
    BoostPinSelection,
    BoostPinSelectionValues,
    BoostVOutSel,
    BoostVOutSelValues,
} from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 boost vout VSET get'),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            vOutVSet: value / 1000, // mV to V
                        },
                        0
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 boost vout SOFTWARE', true),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            vOutSoftware: value / 1000, // mV to V
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
                    toValueRegex(BoostVOutSelValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            vOutSelect: parseColonBasedAnswer(
                                res
                            ) as BoostVOutSel,
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
                    const pinSelection = parseColonBasedAnswer(
                        res
                    ) as BoostPinSelection;
                    const pinModeEnabled = pinSelection !== 'OFF';
                    eventEmitter.emitPartialEvent<Boost>(
                        'onBoostUpdate',
                        {
                            pinSelection,
                            pinModeEnabled,
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
                            overCurrentProtection: parseOnOff(res),
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
