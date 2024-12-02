/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { LowPowerModule } from '../../types';
import shipModeCallbacks from './lowPowerCallbacks';
import { LowPowerGet } from './lowPowerGetters';
import { LowPowerSet } from './lowPowerSetters';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): LowPowerModule => ({
    get: new LowPowerGet(sendCommand),
    set: new LowPowerSet(eventEmitter, sendCommand, offlineMode),
    callbacks: shipModeCallbacks(shellParser, eventEmitter),
    defaults: {
        timeToActive: 96,
        invPolarity: true,
    },
});
