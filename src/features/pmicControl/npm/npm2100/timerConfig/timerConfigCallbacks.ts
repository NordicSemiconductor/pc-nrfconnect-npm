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
    parseToFloat,
    selectFromTypeValues,
    toRegex,
    toValueRegexString,
} from '../../pmicHelpers';
import { TimerConfig } from '../../types';
import { npm2100TimerMode } from '../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    // Mode
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 timer mode',
                    true,
                    undefined,
                    toValueRegexString(
                        Object.keys(npm2100TimerMode).map(
                            key =>
                                npm2100TimerMode[
                                    key as keyof typeof npm2100TimerMode
                                ],
                        ),
                    ),
                ),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            mode: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                Object.values(npm2100TimerMode),
                            ) as npm2100TimerMode,
                        },
                    );
                },
                noop,
            ),
        );

        // State (enabled)
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 timer state',
                    true,
                    undefined,
                    toValueRegexString(['ENABLE', 'DISABLE', 'BUSY', 'IDLE']),
                ),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            enabled:
                                parseColonBasedAnswer(res).toUpperCase() ===
                                    'ENABLE' ||
                                parseColonBasedAnswer(res).toUpperCase() ===
                                    'BUSY',
                        },
                    );
                },
                noop,
            ),
        );

        // Period
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm2100 timer period', true),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            period: parseToFloat(res) * 1000,
                        },
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
