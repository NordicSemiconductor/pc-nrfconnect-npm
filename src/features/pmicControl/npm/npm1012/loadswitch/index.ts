/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LoadSwitch,
    LoadSwitchExport,
    LoadSwitchModule,
    ModuleParams,
} from '../../types';
import LoadSwitchCallbacks from './callbacks';
import { LoadSwitchGet } from './getters';
import { LoadSwitchSet } from './setters';
import { onOffControlValues } from './types';

const softStartCurrentLimitValues = [0, 10, 20, 35, 50] as readonly number[];
const softStartTimeValues = [0, 1.5, 4.5, 7.5, 10.5] as readonly number[];

const loadSwitchDefaults = (): LoadSwitch => ({
    activeDischarge: false,
    cardLabel: 'Load Switch 2',
    enable: false,
    onOffControl: 'Software',
    overCurrentProtection: false,
    softStartCurrentLimit: 20,
    softStartTime: 4.5,
});

const loadSwitchValues = {
    onOffControl: onOffControlValues.map(val => ({
        label: val,
        value: val,
    })),
    softStartCurrentLimit: softStartCurrentLimitValues.map(val => ({
        label: val === 0 ? 'Off' : `${val} mA`,
        value: val,
    })),
    softStartTime: softStartTimeValues.map(val => ({
        label: val === 0 ? 'Off' : `${val} ms`,
        value: val,
    })),
};

export const toLoadSwitchExport = (
    loadSwitch: LoadSwitch,
): LoadSwitchExport => ({
    activeDischarge: loadSwitch.activeDischarge,
    enable: loadSwitch.enable,
    onOffControl: loadSwitch.onOffControl,
    overCurrentProtection: loadSwitch.overCurrentProtection,
    softStartCurrentLimit: loadSwitch.softStartCurrentLimit,
    softStartTime: loadSwitch.softStartTime,
});

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements LoadSwitchModule {
    index: number;
    private _get: LoadSwitchGet;
    private _set: LoadSwitchSet;
    private _callbacks: (() => void)[];

    constructor({
        index,
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this.index = index;
        this._get = new LoadSwitchGet(sendCommand);
        this._set = new LoadSwitchSet(
            eventEmitter,
            sendCommand,
            offlineMode,
            index,
        );
        this._callbacks = LoadSwitchCallbacks(shellParser, eventEmitter, index);
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): LoadSwitch {
        return loadSwitchDefaults();
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get values(): LoadSwitchModule['values'] {
        return loadSwitchValues;
    }
}
