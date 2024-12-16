/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    onOffRegex,
    parseColonBasedAnswer,
    parseOnOff,
    selectFromTypeValues,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { npm2100LowPowerConfig, npm2100TimeToActive } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

    const npm2100TimeToActiveValues = Object.keys(npm2100TimeToActive).map(
        key => npm2100TimeToActive[key as keyof typeof npm2100TimeToActive]
    );

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 low_power_control hibernate_debounce',
                    true,
                    undefined,
                    toValueRegex(npm2100TimeToActiveValues)
                ),
                res => {
                    eventEmitter.emitPartialEvent<npm2100LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            timeToActive: selectFromTypeValues(
                                parseColonBasedAnswer(res),
                                npm2100TimeToActiveValues
                            ) as npm2100TimeToActive,
                        }
                    );
                },
                noop
            )
        );

        // Power button enable
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 low_power_control pwr_btn',
                    true,
                    undefined,
                    onOffRegex
                ),
                res => {
                    eventEmitter.emitPartialEvent<npm2100LowPowerConfig>(
                        'onLowPowerUpdate',
                        {
                            powerButtonEnable: parseOnOff(res),
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npm2100 low_power_control ship_mode (ship_mode|hibernate_mode|hibernate_pt_mode)'
                ),
                () => {
                    eventEmitter.emit('onReboot', true);
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
