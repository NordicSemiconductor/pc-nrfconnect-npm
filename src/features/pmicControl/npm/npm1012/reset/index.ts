/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type ModuleParams,
    type ResetConfig,
    type ResetExport,
    type ResetModule,
} from '../../types';
import resetCallbacks from './callbacks';
import { ResetGet } from './getters';
import { ResetSet } from './setters';
import {
    longPressResetDebounceKeys,
    longPressResetDebounceValues,
    longPressResetPinSelKeys,
    longPressResetPinSelValues,
    powerDownWaitKeys,
    powerDownWaitValues,
} from './types';

export const toResetExport = (config: ResetConfig): ResetExport => ({
    longPressResetPinSel: config.longPressResetPinSel,
    longPressResetDebounce: config.longPressResetDebounce,
    longPressResetEnable: config.longPressResetEnable,
    powerDownWait: config.powerDownWait,
});

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements ResetModule {
    private _callbacks: (() => void)[];
    private _get: ResetGet;
    private _set: ResetSet;

    constructor({
        sendCommand,
        eventEmitter,
        shellParser,
        offlineMode,
    }: ModuleParams) {
        this._callbacks = resetCallbacks(shellParser, eventEmitter);
        this._get = new ResetGet(sendCommand);
        this._set = new ResetSet(eventEmitter, sendCommand, offlineMode);
    }

    get actions(): { powerCycle?: () => Promise<void> } {
        return {};
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): ResetConfig {
        return {
            longPressResetPinSel: 'OFF',
            longPressResetDebounce: '3s',
            longPressResetDebounceSelDisabled: true,
            longPressResetEnable: true,
            powerDownWait: '350ms',
        };
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get values(): ResetModule['values'] {
        return {
            longPressResetPinSel: longPressResetPinSelKeys.map((item, i) => ({
                label: longPressResetPinSelValues[i],
                value: item,
            })),
            longPressResetDebounce: longPressResetDebounceKeys.map(
                (item, i) => ({
                    label: longPressResetDebounceValues[i],
                    value: item,
                }),
            ),
            powerDownWait: powerDownWaitKeys.map((item, i) => ({
                label: powerDownWaitValues[i],
                value: item,
            })),
        };
    }
}
