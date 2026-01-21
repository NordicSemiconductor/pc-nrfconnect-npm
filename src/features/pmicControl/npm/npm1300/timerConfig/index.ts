/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type RangeType } from '../../../../../utils/helpers';
import {
    type ModuleParams,
    type TimerConfig,
    type TimerConfigModule,
    type TimerMode,
} from '../../types';
import timerCallbacks from './callbacks';
import { TimerConfigGet } from './getters';
import { TimerConfigSet } from './setters';
import { npm1300TimerMode, TimerModeKeys, TimerModeValues } from './types';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements TimerConfigModule {
    private _get: TimerConfigGet;
    private _set: TimerConfigSet;
    private _callbacks: (() => void)[];

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
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
    get values(): { mode: { label: string; value: TimerMode }[] } {
        return {
            mode: [...TimerModeValues].map((item, i) => ({
                label: `${TimerModeKeys[i]}`,
                value: item,
            })),
        };
    }
    get ranges(): { periodRange: (prescalerMultiplier: number) => RangeType } {
        return {
            periodRange: prescalerMultiplier => ({
                min: 0,
                max: 16777215 * prescalerMultiplier,
                decimals: 0,
                step: 1 * prescalerMultiplier,
            }),
        };
    }
    get defaults(): TimerConfig {
        return {
            mode: npm1300TimerMode['Boot monitor'], // Boot monitor is default
            prescaler: 'Slow',
            period: 0,
        };
    }

    getPrescalerMultiplier(timerConfig: TimerConfig) {
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
    }
}
