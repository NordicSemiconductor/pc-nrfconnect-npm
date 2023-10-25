/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { PmicDialog } from '../../types';
import buckCallbacks from './buckCallbacks';
import { buckGet, buckSet } from './buckEffects';

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
    buckGet: buckGet(sendCommand),
    buckSet: buckSet(eventEmitter, sendCommand, dialogHandler, offlineMode),
    buckCallbacks: buckCallbacks(shellParser, eventEmitter, noOfBucks),
    buckRanges: {
        getBuckVoltageRange: () => ({
            min: 1,
            max: 3.3,
            decimals: 1,
        }),

        getBuckRetVOutRange: () => ({
            min: 1,
            max: 3,
            decimals: 1,
        }),
    },
});
