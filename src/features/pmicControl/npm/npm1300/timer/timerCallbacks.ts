/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import {
    TimerConfig,
    TimerModeValues,
    TimerPrescalerValues,
} from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config mode', true, undefined, '[0-4]'),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            mode: TimerModeValues[parseToNumber(res)],
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx timer config prescaler',
                    true,
                    undefined,
                    '[0-1]'
                ),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            prescaler: TimerPrescalerValues[parseToNumber(res)],
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx timer config period', true),
                res => {
                    eventEmitter.emitPartialEvent<TimerConfig>(
                        'onTimerConfigUpdate',
                        {
                            period: parseToNumber(res),
                        }
                    );
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
