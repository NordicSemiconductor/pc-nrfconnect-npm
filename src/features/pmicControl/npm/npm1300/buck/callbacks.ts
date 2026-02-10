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
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { type Buck, type BuckModeControl, GPIOValues } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    index: number,
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx buck voltage normal', true, index),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutNormal: value / 1000, // mV to V
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx buck voltage retention', true, index),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutRetention: value / 1000, // mV to V
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx buck vout_select', true, index),
                res => {
                    const value = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            mode: value === 0 ? 'vSet' : 'software',
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx buck status', true, index),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            enabled: parseToBoolean(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx buck gpio on_off index',
                    true,
                    index,
                    '(-1|[0-4])',
                ),
                res => {
                    const result = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            onOffControl:
                                result === -1 ? 'Off' : GPIOValues[result],
                            onOffSoftwareControlEnabled: result === -1, // Disable on GPIO control, enable on SW control
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx buck gpio retention index',
                    true,
                    index,
                    '(-1|[0-4])',
                ),
                res => {
                    const result = parseToNumber(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            retentionControl:
                                result === -1 ? 'Off' : GPIOValues[result],
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('powerup_buck mode', true, index, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res);
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            modeControl: result as BuckModeControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx buck active_discharge', true, index, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            activeDischarge: parseToBoolean(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
