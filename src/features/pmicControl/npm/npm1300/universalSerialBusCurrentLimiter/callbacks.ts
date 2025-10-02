/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
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
import { USBDetectStatusValues, USBPower } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx vbusin current_limit', true),
                res => {
                    eventEmitter.emit('onUsbPower', {
                        currentLimiter: parseToNumber(res) / 1000,
                    });
                },
                noop,
            ),
        );
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'powerup_vbusin status get',
                    false,
                    undefined,
                    '(0|1|2|3)',
                ),
                res => {
                    eventEmitter.emitPartialEvent<USBPower>('onUsbPower', {
                        detectStatus: USBDetectStatusValues[parseToNumber(res)],
                    });
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
