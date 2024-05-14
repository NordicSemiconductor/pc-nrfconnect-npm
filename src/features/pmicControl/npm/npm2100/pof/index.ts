/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import pofCallbacks from './pofCallbacks';
import { pofGet, pofSet } from './pofEffects';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => ({
    pofGet: pofGet(sendCommand),
    pofSet: pofSet(eventEmitter, sendCommand, offlineMode),
    pofCallbacks: pofCallbacks(shellParser, eventEmitter),
    pofRanges: {
        getPOFThresholdRange: () => ({
            min: 2.6,
            max: 3.5,
            decimals: 1,
            step: 0.1,
        }),
    },
});
