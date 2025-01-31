/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { TimerConfig, TimerConfigModule, TimerMode } from '../../types';
import { npm2100TimerMode } from '../types';
import timerCallbacks from './timerConfigCallbacks';
import { TimerConfigGet } from './timerConfigGetter';
import { TimerConfigSet } from './timerConfigSetter';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements TimerConfigModule {
    private _get: TimerConfigGet;
    private _set: TimerConfigSet;
    private _callbacks: (() => void)[];
    constructor(
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        offlineMode: boolean
    ) {
        this._get = new TimerConfigGet(sendCommand);
        this._set = new TimerConfigSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = timerCallbacks(shellParser, eventEmitter);
    }
    get get() {
        return this._get;
    }
    get set() {
        return this._set;
    }
    get callbacks() {
        return this._callbacks;
    }
    get values(): {
        mode: { label: string; value: TimerMode }[];
    } {
        return {
            mode: Object.keys(npm2100TimerMode).map(key => ({
                label: `${key}`,
                value: npm2100TimerMode[key as keyof typeof npm2100TimerMode],
            })),
        };
    }
    get ranges(): {
        periodRange: (prescalerMultiplier: number) => RangeType;
    } {
        return {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            periodRange: prescalerMultiplier => ({
                min: 0,
                // max: 16777215 * prescalerMultiplier,
                max: 262143 * 1000,
                decimals: 3,
                // step: 1 * prescalerMultiplier,
                step: 1,
            }),
        };
    }
    get defaults(): TimerConfig {
        return {
            enabled: false,
            mode: npm2100TimerMode['General Purpose'],
            period: 0,
        };
    }
}
