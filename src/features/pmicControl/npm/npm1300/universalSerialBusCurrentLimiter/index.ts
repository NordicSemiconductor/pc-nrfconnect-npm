/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getRange } from '../../../../../utils/helpers';
import {
    type ModuleParams,
    type UsbCurrentLimiterModule,
    type USBPower,
} from '../../types';
import callbacks from './callbacks';
import { UsbCurrentLimiterGet } from './getters';
import { UsbCurrentLimiterSet } from './setters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements UsbCurrentLimiterModule {
    private _get: UsbCurrentLimiterGet;
    private _set: UsbCurrentLimiterSet;
    private _callbacks: (() => void)[];

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._get = new UsbCurrentLimiterGet(sendCommand);
        this._set = new UsbCurrentLimiterSet(
            eventEmitter,
            sendCommand,
            offlineMode,
        );
        this._callbacks = callbacks(shellParser, eventEmitter);
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
    get defaults(): USBPower {
        return {
            detectStatus: 'No USB connection',
            currentLimiter: 0.1,
        };
    }
    get ranges(): { vBusInLimiter: number[] } {
        return {
            vBusInLimiter: [
                0.1,
                ...getRange([
                    {
                        min: 0.5,
                        max: 1.5,
                        step: 0.1,
                    },
                ]).map(v => Number(v.toFixed(2))),
            ],
        };
    }
}
