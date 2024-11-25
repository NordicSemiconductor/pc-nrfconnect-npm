/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { ResetModule } from '../../types';
import resetCallbacks from './resetCallbacks';
import { ResetGet } from './resetGetters';
import { ResetSet } from './resetSetters';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): ResetModule => ({
    get: new ResetGet(sendCommand),
    set: new ResetSet(eventEmitter, sendCommand, offlineMode),
    callbacks: resetCallbacks(shellParser, eventEmitter),
    defaults: {
        longPressReset: 'one_button',
    },
});
