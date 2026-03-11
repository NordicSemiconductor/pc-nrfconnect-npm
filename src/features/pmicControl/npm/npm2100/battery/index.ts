/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type BatteryModule, type ModuleParams } from '../../types';
import batteryCallbacks from './batteryCallbacks';
import { BatteryGet } from './BatteryGet';

/* eslint-disable no-underscore-dangle */

export type PowerID2100 = 'VEXT' | 'VBAT';

export default class Module implements BatteryModule {
    private _get: BatteryGet;
    private _callbacks: (() => void)[];
    constructor({ sendCommand, eventEmitter, shellParser }: ModuleParams) {
        this._get = new BatteryGet(sendCommand);
        this._callbacks = batteryCallbacks(shellParser, eventEmitter);
    }

    get get() {
        return this._get;
    }
    get callbacks() {
        return this._callbacks;
    }
}
