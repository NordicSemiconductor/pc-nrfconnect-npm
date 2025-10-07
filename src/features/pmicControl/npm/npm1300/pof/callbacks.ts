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
import { POF, POFPolarityValues } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx pof status', true, undefined, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                        enable: parseToBoolean(res),
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx pof polarity', true, undefined, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                        polarity: POFPolarityValues[parseToNumber(res)],
                    });
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx pof threshold', true),
                res => {
                    eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                        threshold: parseToNumber(res) / 1000, // mV to V
                    });
                },
                noop,
            ),
        );
    }
    return cleanupCallbacks;
};
