/*
 * Copyright (c) 20124 Nordic Semiconductor ASA
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

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
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
                noop
            )
        );
    }

    return cleanupCallbacks;
};
