/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseToFloat,
    toRegex,
} from '../../pmicHelpers';
import { OnBoardLoad } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('cc_sink level', true),
                res => {
                    eventEmitter.emitPartialEvent<OnBoardLoad>(
                        'onOnBoardLoadUpdate',
                        {
                            iLoad: parseToFloat(res),
                        }
                    );
                },
                noop
            )
        );
    }

    return cleanupCallbacks;
};
