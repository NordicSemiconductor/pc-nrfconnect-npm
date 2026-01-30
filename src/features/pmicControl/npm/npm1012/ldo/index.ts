/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import { Ldo, LdoExport, LdoModule, ModuleParams } from '../../types';
import ldoCallbacks from './callbacks';
import { LdoGet } from './getters';
import { LdoSet } from './setters';
import { LdoOnOffControlValues1012 } from './types';

const ldoDefaults = (): Ldo => ({
    activeDischarge: false,
    enabled: false,
    mode: 'Load_switch',
    ocpEnabled: false,
    onOffControl: 'Software',
    onOffSoftwareControlEnabled: true,
    voltage: voltageRange.min,
    cardLabel: 'Load Switch/LDO 1',

    softStartCurrentLimit: 20,
    softStartTime: 4.5,
    vOutSel: 'Vset',
    weakPullDown: false,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    activeDischarge: ldo.activeDischarge,
    enabled: ldo.enabled,
    mode: ldo.mode,
    ocpEnabled: ldo.ocpEnabled,
    onOffControl: ldo.onOffControl,
    voltage: ldo.voltage,

    softStartCurrentLimit: ldo.softStartCurrentLimit,
    softStartTime: ldo.softStartTime,
    vOutSel: ldo.vOutSel,
    weakPullDown: ldo.weakPullDown,
});

const voltageRange: RangeType = {
    min: 1,
    max: 3.3,
    decimals: 2,
    step: 0.05,
};

const softStartCurrentLimitValues = [0, 10, 20, 35, 50] as readonly number[];
const softStartTimeValues = [0, 1.5, 4.5, 7.5, 10.5] as readonly number[];

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements LdoModule {
    index: number;
    private _get: LdoGet;
    private _set: LdoSet;
    private _callbacks: (() => void)[];
    constructor({
        index,
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this.index = index;
        this._get = new LdoGet(sendCommand);
        this._set = new LdoSet(eventEmitter, sendCommand, offlineMode, index);
        this._callbacks = ldoCallbacks(shellParser, eventEmitter, index);
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

    get values(): LdoModule['values'] {
        return {
            onOffControl: LdoOnOffControlValues1012.map(val => ({
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
    }

    get ranges(): LdoModule['ranges'] {
        return {
            voltage: voltageRange,
        };
    }

    get defaults(): Ldo {
        return ldoDefaults();
    }
}
