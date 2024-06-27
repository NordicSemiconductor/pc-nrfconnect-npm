/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
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
    const batteryCommandCallbacks = [];

    if (shellParser) {
        // Battery Input Detect
        batteryCommandCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('batt_input_detect', true, undefined),
                res => {
                    eventEmitter.emit(
                        'onBatteryAddonBoardIdUpdate',
                        parseToNumber(res)
                    );
                },
                noop
            )
        );
    }

    return batteryCommandCallbacks;
};
