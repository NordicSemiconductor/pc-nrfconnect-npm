/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { type TimerConfig, TimerPrescalerValues } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config mode', true, undefined, '[0-4]'),
                res => {
                    const value = parseToNumber(res);

                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            mode: value,
                        },
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx timer config prescaler',
                    true,
                    undefined,
                    '[0-1]',
                ),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            prescaler: TimerPrescalerValues[parseToNumber(res)],
                        },
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config compare', true),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            period: parseToNumber(res),
                        },
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
