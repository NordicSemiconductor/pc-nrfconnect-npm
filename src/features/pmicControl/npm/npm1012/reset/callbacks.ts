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
    toRegex,
} from '../../pmicHelpers';
import {
    type LongPressResetDebounce,
    type LongPressResetPinSel,
    type PowerDownWait,
    type ResetConfig,
} from '../../types';

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
            toRegex(
                'npm1012 reset_ctrl long_press_reset debounce',
                true,
                undefined,
                '(\\w+)',
            ),
            res => {
                const result = parseColonBasedAnswer(res);
                eventEmitter.emitPartialEvent<ResetConfig>('onResetUpdate', {
                    longPressResetDebounce: result as LongPressResetDebounce,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 reset_ctrl long_press_reset enable',
                true,
                undefined,
                onOffRegex,
            ),
            res => {
                const result = parseOnOff(res);
                eventEmitter.emitPartialEvent<ResetConfig>('onResetUpdate', {
                    longPressResetEnable: result,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 reset_ctrl long_press_reset pinsel',
                true,
                undefined,
                '(\\w+)',
            ),
            res => {
                const result = parseColonBasedAnswer(res);
                eventEmitter.emitPartialEvent<ResetConfig>('onResetUpdate', {
                    longPressResetPinSel: result as LongPressResetPinSel,
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex(
                'npm1012 reset_ctrl powerdown_wait',
                true,
                undefined,
                '(\\w+)',
            ),
            res => {
                const result = parseColonBasedAnswer(res);
                eventEmitter.emitPartialEvent<ResetConfig>('onResetUpdate', {
                    powerDownWait: result as PowerDownWait,
                });
            },
            noop,
        ),
    );

    return callbacks;
};
