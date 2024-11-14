/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { TimerConfigModule } from '../../types';
import { npm2100TimerMode } from '../types';
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
    values: {
        mode: Object.keys(npm2100TimerMode).map(key => ({
            label: `${key}`,
            value: npm2100TimerMode[key as keyof typeof npm2100TimerMode],
        })),
    },
    callbacks: timerCallbacks(shellParser, eventEmitter),
    ranges: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        periodRange: prescalerMultiplier => ({
            min: 0,
            // max: 16777215 * prescalerMultiplier,
            max: 262143 * 1000,
            decimals: 3,
            // step: 1 * prescalerMultiplier,
            step: 1,
        }),
    },
    defaults: {
        enabled: false,
        mode: npm2100TimerMode['General Purpose'],
        period: 0,
    },
});
