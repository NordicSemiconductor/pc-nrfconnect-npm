/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import timerCallbacks from './timerCallbacks';
import { timerGet, timerSet } from './timerEffects';

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
    timerGet: timerGet(sendCommand),
    timerSet: timerSet(eventEmitter, sendCommand, offlineMode),
    timerCallbacks: timerCallbacks(shellParser, eventEmitter),
});
