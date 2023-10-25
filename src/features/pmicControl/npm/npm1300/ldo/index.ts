/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { PmicDialog } from '../../types';
import ldoCallbacks from './ldoCallbacks';
import { ldoGet, ldoSet } from './ldoEffects';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    dialogHandler: ((dialog: PmicDialog) => void) | null,
    offlineMode: boolean,
    noOfBucks: number
) => ({
    ldoGet: ldoGet(sendCommand),
    ldoSet: ldoSet(eventEmitter, sendCommand, dialogHandler, offlineMode),
    ldoCallbacks: ldoCallbacks(shellParser, eventEmitter, noOfBucks),
    ldoRanges: {
        getLdoVoltageRange: () => ({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        }),
    },
});
