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
    toValueRegex,
} from '../../pmicHelpers';
import { type LowPowerConfig, type TimeToActive } from '../../types';
import { timeToActiveValues } from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx ship config time',
                    true,
                    undefined,
                    toValueRegex(timeToActiveValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            timeToActive: parseColonBasedAnswer(
                                res,
                            ) as TimeToActive,
                        },
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship mode (ship|hibernate)'),
                () => {
                    eventEmitter.emit('onReboot', true);
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
