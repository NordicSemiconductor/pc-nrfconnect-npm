/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseOnOff,
    parseToFloat,
    toRegex,
} from '../../pmicHelpers';
import { type TimerConfig, type TimerMode } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    if (shellParser === undefined) {
        return [];
    }

    const callbacks = [];

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 timer state', true, undefined, onOffRegex),
            res => {
                eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        enabled: parseOnOff(res),
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 timer mode', true, undefined, '(\\w+)'),
            res => {
                eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        mode: parseColonBasedAnswer(res) as TimerMode,
                    },
                );
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 timer period', true),
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

    return callbacks;
};
