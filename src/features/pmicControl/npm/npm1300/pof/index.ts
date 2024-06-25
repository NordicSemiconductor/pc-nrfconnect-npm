/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { PofModule } from '../../types';
import pofCallbacks from './pofCallbacks';
import { PofGet } from './pofGetters';
import { PofSet } from './pofSetter';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): PofModule => ({
    get: new PofGet(sendCommand),
    set: new PofSet(eventEmitter, sendCommand, offlineMode),
    callbacks: pofCallbacks(shellParser, eventEmitter),
    ranges: {
        thresholdRange: () => ({
            min: 2.6,
            max: 3.5,
            decimals: 1,
            step: 0.1,
        }),
    },
    defaults: {
        enable: true,
        threshold: 2.8,
        polarity: 'Active high',
    },
});
