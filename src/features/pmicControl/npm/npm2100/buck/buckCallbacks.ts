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
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { Buck, BuckModeControl, GPIOValues } from '../../types';

const setupSingleBuck = (
    shellParser: ShellParser,
    eventEmitter: NpmEventEmitter,
    i: number
) => {
    const cleanupCallbacks = [];
    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck voltage normal', true, i),
            res => {
                const value = parseToNumber(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutNormal: value / 1000, // mV to V
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck voltage retention', true, i),
            res => {
                const value = parseToNumber(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutRetention: value / 1000, // mV to V
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck vout_select', true, i),
            res => {
                const value = parseToNumber(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        mode: value === 0 ? 'vSet' : 'software',
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck status', true, i),
            res => {
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        enabled: parseToBoolean(res),
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck gpio on_off index', true, i, '(-1|[0-4])'),
            res => {
                const result = parseToNumber(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        onOffControl:
                            result === -1 ? 'Off' : GPIOValues[result],
                        onOffSoftwareControlEnabled: result === -1, // Disable on GPIO control, enable on SW control
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck gpio retention index', true, i, '(-1|[0-4])'),
            res => {
                const result = parseToNumber(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        retentionControl:
                            result === -1 ? 'Off' : GPIOValues[result],
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('powerup_buck mode', true, i, '(\\w+)'),
            res => {
                const result = parseColonBasedAnswer(res);
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        modeControl: result as BuckModeControl,
                    },
                    i
                );
            },
            noop
        )
    );

    cleanupCallbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npmx buck active_discharge', true, i, '(0|1)'),
            res => {
                eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        activeDischarge: parseToBoolean(res),
                    },
                    i
                );
            },
            noop
        )
    );

    return cleanupCallbacks;
};

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    noOfBucks: number
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        for (let i = 0; i < noOfBucks; i += 1) {
            cleanupCallbacks.push(
                ...setupSingleBuck(shellParser, eventEmitter, i)
            );
        }
    }

    return cleanupCallbacks;
};
