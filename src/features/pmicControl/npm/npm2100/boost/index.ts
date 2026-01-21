/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type RangeType } from '../../../../../utils/helpers';
import { type Boost, type BoostModule, type ModuleParams } from '../../types';
import boostCallbacks from './callbacks';
import { BoostGet } from './getters';
import { BoostSet } from './setters';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

const boostDefaults = (): Boost => ({
    vOutSoftware: voltageRange().min,
    vOutVSet: voltageRange().min,
    vOutSelect: 'Vset',
    modeControl: 'AUTO',
    pinSelection: 'OFF',
    pinMode: 'HP',
    pinModeEnabled: false,
    overCurrentProtection: false,
});

const voltageRange = () =>
    ({
        min: 1.8,
        max: 3.3,
        decimals: 1,
    }) as RangeType;

export default class Module implements BoostModule {
    private _get: BoostGet;
    private _set: BoostSet;
    readonly index: number;
    private _callbacks: (() => void)[];
    constructor({
        sendCommand,
        eventEmitter,
        dialogHandler,
        offlineMode,
        index,
        shellParser,
    }: ModuleParams) {
        this.index = index;
        this._get = new BoostGet(sendCommand);
        this._set = new BoostSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode,
            this.ranges,
        );
        this._callbacks = boostCallbacks(shellParser, eventEmitter);
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
    get ranges(): {
        voltage: RangeType;
    } {
        return {
            voltage: voltageRange(),
        };
    }
    get defaults(): Boost {
        return boostDefaults();
    }
}
