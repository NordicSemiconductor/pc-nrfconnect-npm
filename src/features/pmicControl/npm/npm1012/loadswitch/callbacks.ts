/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
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
    parseToFloat,
    parseToNumber,
    toRegex,
} from '../../pmicHelpers';
import { LoadSwitch } from '../../types';
import { onOffControlValues } from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    index: number,
) => {
    const cleanupCallbacks = [];
    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw activedischarge', true, 1, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            activeDischarge: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw enable', true, 1, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            enable: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw enablectrl', true, 1, '(\\w+)'),
                res => {
                    const result = parseColonBasedAnswer(res).toLowerCase();

                    const onOffControl = onOffControlValues.find(
                        elem => elem.toLowerCase() === result,
                    );

                    if (onOffControl === undefined) {
                        return;
                    }

                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            onOffControl,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw ocp', true, 1, onOffRegex),
                res => {
                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            overCurrentProtection: parseOnOff(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw softstartilim', true, 1, '(\\w+)'),
                res => {
                    const result = parseToNumber(res);

                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            softStartCurrentLimit: Number.isNaN(result)
                                ? 0
                                : result,
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npm1012 ldosw softstarttime', true, 1, '(\\w+)'),
                res => {
                    const result = parseToFloat(res);

                    eventEmitter.emitPartialEvent<LoadSwitch>(
                        'onLoadSwitchUpdate',
                        {
                            softStartTime: Number.isNaN(result) ? 0 : result,
                        },
                        index,
                    );
                },
                noop,
            ),
        );
    }

    return cleanupCallbacks;
};
