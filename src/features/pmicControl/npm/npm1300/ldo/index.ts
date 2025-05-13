/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import { Ldo, LdoExport, LdoModule, ModuleParams } from '../../types';
import ldoCallbacks from './callbacks';
import { LdoGet } from './getters';
import { LdoSet } from './setters';
import { SoftStart, SoftStartValues } from './types';

const ldoDefaults = (): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'Load_switch',
    enabled: false,
    softStartEnabled: true,
    softStart: 20,
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    softStartEnabled: ldo.softStartEnabled,
    softStart: ldo.softStart,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
});

const getLdoVoltageRange = () =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
        step: 0.1,
    } as RangeType);

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
        dialogHandler,
    }: ModuleParams) {
        this.index = index;
        this._get = new LdoGet(sendCommand, index);
        this._set = new LdoSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode,
            index
        );
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

    get values(): {
        softstart: { label: string; value: SoftStart }[];
    } {
        return {
            softstart: [...SoftStartValues].map((item, i) => ({
                label: `${SoftStartValues[i]} mA`,
                value: item,
            })),
        };
    }

    get ranges(): { voltage: RangeType } {
        return {
            voltage: getLdoVoltageRange(),
        };
    }
    get defaults(): Ldo {
        return ldoDefaults();
    }
}
