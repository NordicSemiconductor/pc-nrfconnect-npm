/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { LowPowerModule, npm1300TimeToActive } from '../../types';
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
        timeToActive: npm1300TimeToActive['96ms'],
        invPolarity: true,
    },
    values: {
        timeToActive: Object.keys(npm1300TimeToActive).map(key => ({
            label: `${key}`,
            value: npm1300TimeToActive[key as keyof typeof npm1300TimeToActive],
        })),
    },
});
