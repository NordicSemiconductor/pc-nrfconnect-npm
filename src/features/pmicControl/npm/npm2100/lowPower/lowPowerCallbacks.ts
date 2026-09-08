/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
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
    selectFromTypeValues,
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
                    'npm2100 low_power_control hibernate_debounce',
                    true,
                    undefined,
                    toValueRegex(timeToActiveValues),
                ),
                res => {
                    eventEmitter.emitPartialEvent<LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            timeToActive: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                timeToActiveValues,
                            ) as TimeToActive,
                        },
                    );
                },
                noop,
            ),
        );

        // Power button enable
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 low_power_control pwr_btn',
                    true,
                    undefined,
                    onOffRegex,
                ),
                res => {
                    eventEmitter.emitPartialEvent<LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            powerButtonEnable: parseOnOff(res),
                        },
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 low_power_control ship_mode (ship_mode|hibernate_mode|hibernate_pt_mode)',
                ),
                () => {
                    eventEmitter.emit('onReboot', true);
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
