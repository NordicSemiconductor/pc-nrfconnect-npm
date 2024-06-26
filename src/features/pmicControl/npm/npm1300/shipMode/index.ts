/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { ShipModeModule } from '../../types';
import shipModeCallbacks from './shipModeCallbacks';
import { ShipModeGet } from './shipModeGetters';
import { ShipModeSet } from './shipModeSetters';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): ShipModeModule => ({
    get: new ShipModeGet(sendCommand),
    set: new ShipModeSet(eventEmitter, sendCommand, offlineMode),
    callbacks: shipModeCallbacks(shellParser, eventEmitter),
    defaults: {
        timeToActive: 96,
        invPolarity: true,
        longPressReset: 'one_button',
    },
});
