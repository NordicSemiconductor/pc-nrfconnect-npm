/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ModuleParams, type POF, type PofModule } from '../../types';
import pofCallbacks from './callbacks';
import { PofGet } from './getters';
import { PofSet } from './setters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements PofModule {
    private _callbacks: (() => void)[];
    private _get: PofGet;
    private _set: PofSet;

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._callbacks = pofCallbacks(shellParser, eventEmitter);
        this._get = new PofGet(sendCommand);
        this._set = new PofSet(eventEmitter, sendCommand, offlineMode);
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): POF {
        return {
            resetThreshold: 2.65,
            warnActive: false,
            warnThreshold: 3.05,
        };
    }

    get get() {
        return this._get;
    }

    get ranges(): PofModule['ranges'] {
        return {
            resetThreshold: {
                min: 2.55,
                max: 3.55,
                decimals: 2,
                step: 0.1,
            },
            warnThreshold: {
                min: 2.65,
                max: 3.65,
                decimals: 2,
                step: 0.1,
            },
        };
    }

    get set() {
        return this._set;
    }

    get values() {
        return {};
    }
}
