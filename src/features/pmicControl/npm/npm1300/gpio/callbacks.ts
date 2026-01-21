/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    type NpmEventEmitter,
    parseToBoolean,
    parseToNumber,
    toRegex,
    toValueRegex,
} from '../../pmicHelpers';
import { type GPIO } from '../../types';
import {
    type GPIODrive1300,
    GPIODriveValues,
    GPIOMode1300,
    GPIOModeValues,
    type GPIOPull1300,
    GPIOPullValues,
} from './types';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    index: number,
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx gpio config mode',
                    true,
                    index,
                    toValueRegex(GPIOModeValues),
                ),
                res => {
                    const mode: GPIOMode1300 = parseToNumber(res);
                    if (mode >= 0 && mode < GPIOModeValues.length) {
                        const isInput = GPIOMode1300[mode].startsWith('Input');
                        eventEmitter.emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                mode,
                                pullEnabled: isInput,
                                driveEnabled: !isInput,
                                debounceEnabled: isInput,
                            },
                            index,
                        );
                    }
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx gpio config pull',
                    true,
                    index,
                    toValueRegex(GPIOPullValues),
                ),
                res => {
                    const pull: GPIOPull1300 = parseToNumber(res);
                    if (pull >= 0 && pull < GPIOPullValues.length) {
                        eventEmitter.emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                pull,
                            },
                            index,
                        );
                    }
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'npmx gpio config drive',
                    true,
                    index,
                    toValueRegex(GPIODriveValues),
                ),
                res => {
                    const drive: GPIODrive1300 = parseToNumber(res);
                    if (GPIODriveValues.findIndex(v => v === drive) !== -1) {
                        eventEmitter.emitPartialEvent<GPIO>(
                            'onGPIOUpdate',
                            {
                                drive: parseToNumber(res),
                            },
                            index,
                        );
                    }
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx gpio config open_drain', true, index, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            openDrain: parseToBoolean(res),
                        },
                        index,
                    );
                },
                noop,
            ),
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('npmx gpio config debounce', true, index, '(0|1)'),
                res => {
                    eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            debounce: parseToBoolean(res),
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
