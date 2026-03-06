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
import { OnOffControl, onOffControlValues } from './types';

const ldoDefaults = (index: number): Ldo => {
    const common: Ldo = {
        activeDischarge: false,
        cardLabel: `Load Switch/LDO ${index + 1}`,
        enabled: false,
        onOffControl: 'Software',
        onOffSoftwareControlEnabled: true,
        overcurrentProtection: false,
        softStart: true,
        softStartCurrent: 20,
        softStartTime: 4.5,
    };

    // Load Switch 2
    if (index === 1) {
        return { ...common, cardLabel: 'Load Switch 2' };
    }

    return {
        ...common,
        mode: 'Load_switch',
        vOutSel: 'Vset',
        voltage: voltageRange.min,
        weakPullDown: false,
    };
};

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    activeDischarge: ldo.activeDischarge,
    enabled: ldo.enabled,
    mode: ldo.mode,
    overcurrentProtection: ldo.overcurrentProtection,
    onOffControl: ldo.onOffControl,
    voltage: ldo.voltage,

    softStartCurrent: ldo.softStartCurrent,
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

const softStartCurrentValues = [10, 20, 35, 50] as readonly number[];
const softStartTimeValues = [1.5, 4.5, 7.5, 10.5] as readonly number[];

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
        this._get = new LdoGet(sendCommand, index);
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
            onOffControl: (this.index === 1
                ? ['GPIO', 'Software']
                : onOffControlValues
            ).map(val => ({
                label: val,
                value: val as OnOffControl,
            })),
            softStartCurrent: () =>
                softStartCurrentValues.map(val => ({
                    label: `${val} mA`,
                    value: val,
                })),
            softStartTime: softStartTimeValues.map(val => ({
                label: `${val} ms`,
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
        return ldoDefaults(this.index);
    }
}
