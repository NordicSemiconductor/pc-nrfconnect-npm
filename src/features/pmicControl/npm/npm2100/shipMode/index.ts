/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import shipModeCallbacks from './shipModeCallbacks';
import { shipModeGet, shipModeSet } from './shipModeEffects';

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
    shipModeGet: shipModeGet(sendCommand),
    shipModeSet: shipModeSet(eventEmitter, sendCommand, offlineMode),
    shipModeCallbacks: shipModeCallbacks(shellParser, eventEmitter),
});
