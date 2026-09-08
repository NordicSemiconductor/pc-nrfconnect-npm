/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type ModuleParams,
    type TimerConfig,
    type TimerConfigModule,
} from '../../types';
import timerCallbacks from './callbacks';
import { TimerConfigGet } from './getters';
import { TimerConfigSet } from './setters';
import { modeKeys, modeValues } from './types';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements TimerConfigModule {
    private _callbacks: (() => void)[];
    private _get: TimerConfigGet;
    private _set: TimerConfigSet;

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._callbacks = timerCallbacks(shellParser, eventEmitter);
        this._get = new TimerConfigGet(sendCommand);
        this._set = new TimerConfigSet(eventEmitter, sendCommand, offlineMode);
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): TimerConfig {
        return {
            enabled: false,
            mode: 'GENERAL_PURPOSE',
            period: 15,
        };
    }

    get get() {
        return this._get;
    }

    get ranges(): TimerConfigModule['ranges'] {
        return {
            periodRange: () => ({
                min: 15, // (1 / 64) * 1000
                max: 262143985, // (max_reg_value / 64) * 1000
                decimals: 3,
                step: 1,
            }),
        };
    }

    get set() {
        return this._set;
    }

    get values(): TimerConfigModule['values'] {
        return {
            mode: modeKeys.map((item, i) => ({
                label: modeValues[i],
                value: item,
            })),
        };
    }
}
