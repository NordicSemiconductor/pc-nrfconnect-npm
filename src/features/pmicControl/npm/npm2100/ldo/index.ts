/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import {
    Ldo,
    LdoExport,
    LdoMode,
    LdoModule,
    LdoSoftStartCurrent,
    ModuleParams,
} from '../../types';
import {
    nPM2100GPIOControlModeValues,
    nPM2100GPIOControlPinSelectValues,
    nPM2100LdoModeControlValues,
    softStartCurrentLDOModeKeys,
    softStartCurrentLDOModeValues,
    softStartCurrentLoadSwitchModeKeys,
    softStartCurrentLoadSwitchModeValues,
} from '../types';
import ldoCallbacks from './ldoCallbacks';
import { LdoGet } from './ldoGet';
import { LdoSet } from './ldoSet';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

const ldoDefaults = (index: number): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'Load_switch',
    enabled: false,
    softStartCurrentLDOMode: 75,
    softStartCurrentLoadSwitchMode: 75,
    modeControl: 'auto',
    pinMode: 'HP/OFF',
    pinSel: 'GPIO0HI',
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
    cardLabel: `Load Switch/LDO ${index + 1}`,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    modeControl: ldo.modeControl,
    pinMode: ldo.pinMode,
    pinSel: ldo.pinSel,
    softStartCurrentLDOMode: ldo.softStartCurrentLDOMode,
    softStartCurrentLoadSwitchMode: ldo.softStartCurrentLoadSwitchMode,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
    halt: ldo.halt,
    ramp: ldo.ramp,
    overcurrentProtection: ldo.overcurrentProtection,
});

const getLdoVoltageRange = () =>
    ({
        min: 0.8,
        max: 3,
        decimals: 1,
        step: 0.1,
    }) as RangeType;

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
            offlineMode,
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
    get values(): LdoModule['values'] {
        const getSoftStartCurrentValues = (mode?: LdoMode) => {
            if (mode === undefined) {
                return [{ label: 'n/a', value: 0 }];
            }

            if (mode === 'LDO') {
                return softStartCurrentLDOModeValues.map((item, i) => ({
                    label: `${softStartCurrentLDOModeKeys[i]}`,
                    value: item as LdoSoftStartCurrent,
                }));
            }

            return softStartCurrentLoadSwitchModeValues.map((item, i) => ({
                label: `${softStartCurrentLoadSwitchModeKeys[i]}`,
                value: item as LdoSoftStartCurrent,
            }));
        };
        return {
            modeControl: nPM2100LdoModeControlValues.map(item => ({
                label: item,
                value: item,
            })),
            pinMode: nPM2100GPIOControlModeValues.map(item => ({
                label: item,
                value: item,
            })),
            pinSel: nPM2100GPIOControlPinSelectValues.map(item => ({
                label: item,
                value: item,
            })),
            softStartCurrent: getSoftStartCurrentValues,
        };
    }
    get defaults(): Ldo {
        return ldoDefaults(this.index);
    }
}
