/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    npm1300TimerMode,
    TimerConfig,
    TimerConfigModule,
    TimerMode,
} from '../../types';
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
        mode: Object.keys(npm1300TimerMode).map(key => ({
            label: `${key}`,
            value: npm1300TimerMode[key as keyof typeof npm1300TimerMode],
        })),
    },
    callbacks: timerCallbacks(shellParser, eventEmitter),
    ranges: {
        periodRange: prescalerMultiplier => ({
            min: 0,
            max: 16777215 * prescalerMultiplier,
            decimals: 0,
            step: 1 * prescalerMultiplier,
        }),
    },
    defaults: {
        mode: npm1300TimerMode['Boot monitor'] as TimerMode, // Boot monitor is default
        prescaler: 'Slow',
        period: 0,
    },

    getPrescalerMultiplier: (timerConfig: TimerConfig) => {
        if ('prescaler' in timerConfig) {
            switch (timerConfig.prescaler) {
                case 'Slow':
                    return 16;
                case 'Fast':
                    return 2;
            }
        } else {
            return 16;
        }
    },
});
