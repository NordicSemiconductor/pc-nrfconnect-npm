/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ModuleParams, type SysReg, type SysRegModule } from '../../types';
import SysRegCallbacks from './callbacks';
import { SysRegGet } from './getters';
import { SysRegSet } from './setters';
import {
    vBusDpmKeys,
    vBusDpmValues,
    vBusILimKeys,
    vBusILimValues,
} from './types';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements SysRegModule {
    private _callbacks: (() => void)[];
    private _get: SysRegGet;
    private _set: SysRegSet;

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._callbacks = SysRegCallbacks(shellParser, eventEmitter);
        this._get = new SysRegGet(sendCommand);
        this._set = new SysRegSet(eventEmitter, sendCommand, offlineMode);
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): SysReg {
        return {
            vBusGood: false,
            vBusDpm: '4.35V',
            vBusILim: '100mA',
            vBusPresent: false,
        };
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get values(): SysRegModule['values'] {
        return {
            vBusDpm: vBusDpmKeys.map((item, i) => ({
                label: vBusDpmValues[i],
                value: item,
            })),
            vBusILim: vBusILimKeys.map((item, i) => ({
                label: vBusILimValues[i],
                value: item,
            })),
        };
    }
}
