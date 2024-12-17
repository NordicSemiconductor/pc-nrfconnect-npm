/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { LowPowerModule, npm2100TimeToActive } from '../../types';
import { LowPowerActions } from './lowPowerActions';
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
    actions: new LowPowerActions(eventEmitter, sendCommand, offlineMode),
    callbacks: shipModeCallbacks(shellParser, eventEmitter),
    defaults: {
        timeToActive: npm2100TimeToActive['100ms'],
        powerButtonEnable: true,
    },
    values: {
        timeToActive: Object.keys(npm2100TimeToActive).map(key => ({
            label: `${key}`,
            value: npm2100TimeToActive[key as keyof typeof npm2100TimeToActive],
        })),
    },
});
