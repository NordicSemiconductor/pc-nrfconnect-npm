/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseColonBasedAnswer,
    parseEnabled,
    selectFromTypeValues,
    toRegex,
    toValueRegexString,
} from '../../pmicHelpers';
import { npm2100ResetReason, ResetConfig } from '../../types';
import {
    npm2100LongPressResetDebounce,
    npm2100LongPressResetDebounceValues,
    npm2100ResetPinSelection,
} from '../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        // Long Press Reset Enable
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 reset_ctrl long_press_reset',
                    true,
                    undefined,
                    '(\\w+)'
                ),
                res => {
                    const result = parseEnabled(res);
                    eventEmitter.emitPartialEvent<ResetConfig>(
                        'onResetUpdate',
                        {
                            longPressResetEnable: result,
                        }
                    );
                },
                noop
            )
        );

        // Reset Pin Selection
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 reset_ctrl pin_selection',
                    true,
                    undefined,
                    toValueRegexString(
                        Object.keys(npm2100ResetPinSelection).map(
                            key =>
                                npm2100ResetPinSelection[
                                    key as keyof typeof npm2100ResetPinSelection
                                ]
                        )
                    )
                ),
                res => {
                    eventEmitter.emitPartialEvent<ResetConfig>(
                        'onResetUpdate',
                        {
                            resetPinSelection: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                Object.values(npm2100ResetPinSelection)
                            ) as npm2100ResetPinSelection,
                        }
                    );
                },
                noop
            )
        );

        // Long Press Reset Debounce
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 reset_ctrl long_press_reset_debounce',
                    true,
                    undefined,
                    toValueRegexString(npm2100LongPressResetDebounceValues)
                ),
                res => {
                    // const result = parseColonBasedAnswer(res);
                    eventEmitter.emitPartialEvent<ResetConfig>(
                        'onResetUpdate',
                        {
                            longPressResetDebounce: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                npm2100LongPressResetDebounceValues
                            ) as npm2100LongPressResetDebounce,
                        }
                    );
                },
                noop
            )
        );

        // Reset Reason
        const resetReasonPattern = /^Reason=(?<reason>.*?),BOR=(?<bor>.*)$/;
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 reset_ctrl reset_reason',
                    true,
                    undefined,
                    resetReasonPattern
                ),
                res => {
                    const data = parseColonBasedAnswer(res);

                    const matches = data.match(resetReasonPattern);

                    // Valid message
                    if (matches?.groups) {
                        const resetReason: npm2100ResetReason = {
                            reason: matches?.groups.reason,
                            bor: matches?.groups.bor,
                        };

                        eventEmitter.emitPartialEvent<ResetConfig>(
                            'onResetUpdate',
                            {
                                resetReason,
                            }
                        );
                    }
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
