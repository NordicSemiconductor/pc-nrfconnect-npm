/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { TimerConfigModule } from '../../types';
import timerCallbacks from './timerConfigCallbacks';
import { TimerConfigGet } from './timerConfigGetter';
import { TimerConfigSet } from './timerConfigSetter';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): TimerConfigModule => ({
    get: new TimerConfigGet(sendCommand),
    set: new TimerConfigSet(eventEmitter, sendCommand, offlineMode),
    callbacks: timerCallbacks(shellParser, eventEmitter),
    defaults: {
        mode: 'Boot monitor',
        prescaler: 'Slow',
        period: 0,
    },
});
