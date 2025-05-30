/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import { ModuleParams, POF, PofModule } from '../../types';
import pofCallbacks from './callbacks';
import { PofGet } from './getters';
import { PofSet } from './setter';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements PofModule {
    private _get: PofGet;
    private _set: PofSet;
    private _callbacks: (() => void)[];
    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._get = new PofGet(sendCommand);
        this._set = new PofSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = pofCallbacks(shellParser, eventEmitter);
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
    get ranges(): { threshold: RangeType } {
        return {
            threshold: {
                min: 2.6,
                max: 3.5,
                decimals: 1,
                step: 0.1,
            },
        };
    }
    get defaults(): POF {
        return {
            enable: true,
            threshold: 2.8,
            polarity: 'Active high',
        };
    }
}
