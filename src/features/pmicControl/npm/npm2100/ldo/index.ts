/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import { Ldo, LdoExport, LdoModule, ModuleParams } from '../../types';
import {
    nPM2100LDOSoftStart,
    nPM2100LDOSoftStartKeys,
    nPM2100LDOSoftStartValues,
    nPM2100SoftStart,
    nPM2100SoftStartKeys,
    nPM2100SoftStartValues,
} from '../types';
import ldoCallbacks from './ldoCallbacks';
import { LdoGet } from './ldoGet';
import { LdoSet } from './ldoSet';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

const ldoDefaults = (): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'Load_switch',
    enabled: false,
    softStartEnabled: true,
    softStart: 20,
    modeControl: 'auto',
    pinMode: 'HP/OFF',
    pinSel: 'GPIO0HI',
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    modeControl: ldo.modeControl,
    pinMode: ldo.pinMode,
    pinSel: ldo.pinSel,
    softStartEnabled: ldo.softStartEnabled,
    softStart: ldo.softStart,
    ldoSoftStart: ldo.ldoSoftStart,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
    haltEnabled: ldo.haltEnabled,
    rampEnabled: ldo.rampEnabled,
    ocpEnabled: ldo.ocpEnabled,
});

const getLdoVoltageRange = () =>
    ({
        min: 0.8,
        max: 3,
        decimals: 1,
        step: 0.1,
    } as RangeType);

export default class Module implements LdoModule {
    index: number;
    private _get: LdoGet;
    private _set: LdoSet;
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
        this._get = new LdoGet(sendCommand);
        this._set = new LdoSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode
        );
        this._callbacks = ldoCallbacks(shellParser, eventEmitter);
    }

    get get(): LdoGet {
        return this._get;
    }
    get set(): LdoSet {
        return this._set;
    }
    get callbacks(): (() => void)[] {
        return this._callbacks;
    }
    get ranges(): { voltage: RangeType } {
        return {
            voltage: getLdoVoltageRange(),
        };
    }
    get values(): {
        softstart: { label: string; value: nPM2100SoftStart }[];
        ldoSoftstart: { label: string; value: nPM2100LDOSoftStart }[];
    } {
        return {
            softstart: [...nPM2100SoftStartValues].map((item, i) => ({
                label: `${nPM2100SoftStartKeys[i]}`,
                value: item,
            })),
            ldoSoftstart: [...nPM2100LDOSoftStartValues].map((item, i) => ({
                label: `${nPM2100LDOSoftStartKeys[i]}`,
                value: item,
            })),
        };
    }
    get defaults(): Ldo {
        return ldoDefaults();
    }
}
