/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    parseColonBasedAnswer,
    parseToFloat,
    toRegex,
} from '../../pmicHelpers';
import { type POF } from '../../types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
) => {
    if (!shellParser) {
        return [];
    }

    const callbacks = [];

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 reset_ctrl pof reset_threshold', true),
            res => {
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    resetThreshold: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 reset_ctrl pof status', true, undefined, '(\\w+)'),
            res => {
                const pofUpdate: Partial<POF> = {};
                switch (parseColonBasedAnswer(res)) {
                    case 'NO_WARNING':
                        pofUpdate.warnActive = false;
                        break;
                    case 'WARNING':
                        pofUpdate.warnActive = true;
                        break;
                }
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', pofUpdate);
            },
            noop,
        ),
    );

    callbacks.push(
        shellParser.registerCommandCallback(
            toRegex('npm1012 reset_ctrl pof warn_threshold', true),
            res => {
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    warnThreshold: parseToFloat(res),
                });
            },
            noop,
        ),
    );

    return callbacks;
};
