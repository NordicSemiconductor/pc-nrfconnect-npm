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
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { npm1300LowPowerConfig, npm1300TimeToActive } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    const npm1300TimeToActiveValues = Object.keys(npm1300TimeToActive).map(
        key => npm1300TimeToActive[key as keyof typeof npm1300TimeToActive],
    );

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx ship config time',
                    true,
                    undefined,
                    toValueRegex(npm1300TimeToActiveValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<npm1300LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            timeToActive: parseColonBasedAnswer(
                                res,
                            ) as npm1300TimeToActive,
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
