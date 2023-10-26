/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseToBoolean,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { ShipModeConfig, TimeToActive } from '../../types';

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
                toRegex('npmx ship config inv_polarity', true),
                res => {
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            invPolarity: parseToBoolean(res),
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship config inv_polarity', true),
                res => {
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            invPolarity: parseToBoolean(res),
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship reset long_press', true),
                res => {
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            longPressReset: parseToBoolean(res),
                        }
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx ship reset two_buttons', true),
                res => {
                    eventEmitter.emitPartialEvent<ShipModeConfig>(
                        'onShipUpdate',
                        {
                            twoButtonReset: parseToBoolean(res),
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
