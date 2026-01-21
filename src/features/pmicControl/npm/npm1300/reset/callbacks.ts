/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    parseColonBasedAnswer,
    toRegex,
} from '../../pmicHelpers';
import { type LongPressReset, type ResetConfig } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('powerup_ship longpress', true, undefined, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res);
                    eventEmitter.emitPartialEvent<ResetConfig>(
                        'onResetUpdate',
                        {
                            longPressReset: result as LongPressReset,
                        },
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
