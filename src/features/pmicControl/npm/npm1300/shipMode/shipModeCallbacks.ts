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
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { LongPressReset, ShipModeConfig, TimeToActive } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx ship config time',
                    true,
                    undefined,
                    '(16|32|64|96|304|608|1008|3008)'
                ),
                res => {
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            timeToActive: parseToNumber(res) as TimeToActive,
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('powerup_ship longpress', true, undefined, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res);
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            longPressReset: result as LongPressReset,
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship mode (ship|hibernate)'),
                () => {
                    eventEmitter.emit('onReboot', true);
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
