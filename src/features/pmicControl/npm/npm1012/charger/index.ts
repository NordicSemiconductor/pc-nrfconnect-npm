/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getMinValueOfRangeOrNumberArray,
    getRange,
} from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Charger,
    type ChargerModule as ChargerModuleBase,
    ChargerModuleGet,
    ChargerModuleGetBase,
    ChargerModuleRanges,
    ChargerModuleSet,
    ChargerModuleSetBase,
    ITerm,
    ITrickle,
    ModuleParams,
    VTrickleFast,
} from '../../types';
import chargerCallbacks from './callbacks';
import { ChargerGet } from './getters';
import { ChargerSet } from './setters';
import {
    ITermKeys,
    ITermValues,
    ITrickleKeys,
    ITrickleValues,
    VTrickleFastKeys,
    VTrickleFastValues,
} from './types';

export default class Module implements ChargerModuleBase {
    private _get: ChargerModuleGetBase;
    private _set: ChargerModuleSetBase;
    private _callbacks: (() => void)[];

    constructor(
        { sendCommand, eventEmitter, offlineMode, shellParser }: ModuleParams,
        callbacks: (
            shellParser: ShellParser | undefined,
            eventEmitter: NpmEventEmitter,
        ) => (() => void)[] = chargerCallbacks,
        Get: ChargerModuleGet = ChargerGet,
        Set: ChargerModuleSet = ChargerSet,
    ) {
        this._get = new Get(sendCommand);
        this._set = new Set(eventEmitter, sendCommand, offlineMode, this._get);
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

    get defaults(): Charger {
        return {
            vTerm: this.ranges.voltage[0],
            vTrickleFast: 2.5,
            iChg: getMinValueOfRangeOrNumberArray(this.ranges.current),
            enabled: false,
            iTerm: 10,
            iTrickle: 12.5,
            enableRecharging: false,
            enableWeakBatteryCharging: false,
            enableVBatLow: false,
            ntcThermistor: '10 kΩ',
            ntcBeta: 3380,
            tChgStop: 110,
            tChgResume: 100,
            vTermR: 3.6,
            tCold: 0,
            tCool: 10,
            tWarm: 45,
            tHot: 60,
            vWeak: 3.2,
        };
    }

    get ranges(): ChargerModuleRanges {
        return {
            voltage: this.voltageRange,
            vTermR: this.voltageRange,
            jeita: {
                min: -20,
                max: 60,
            },
            chipThermal: {
                min: 50,
                max: 110,
            },
            current: Module.currentRange,
            nTCBeta: {
                min: 0,
                max: 4294967295,
                decimals: 0,
                step: 1,
            },
            vLowerCutOff: {
                min: 2.7,
                max: 3.6,
                step: 0.05,
                decimals: 2,
            },
            batterySize: {
                min: 32,
                max: 3000,
            },
            vWeak: {
                min: 2.5,
                max: 4.0,
                step: 0.1,
                decimals: 1,
            },
        };
    }

    protected static get currentRange() {
        return getRange([
            {
                min: 0.5,
                max: 128,
                step: 0.5,
                decimals: 1,
            },
            {
                min: 129,
                max: 256,
                step: 1,
                decimals: 0,
            },
        ]).map(v => Number(v.toFixed(1)));
    }

    // eslint-disable-next-line class-methods-use-this
    protected get voltageRange() {
        return getRange([
            {
                min: 3.5,
                max: 4.65,
                step: 0.01,
                decimals: 2,
            },
        ]).map(v => Number(v.toFixed(2)));
    }

    // eslint-disable-next-line class-methods-use-this
    get values(): {
        iTerm: { label: string; value: ITerm }[];
        iTrickle: { label: string; value: ITrickle }[];
        vTrickleFast: { label: string; value: VTrickleFast }[];
    } {
        return {
            iTerm: [...ITermValues].map((item, i) => ({
                label: `${ITermKeys[i]}`,
                value: item,
            })),
            iTrickle: [...ITrickleValues].map((item, i) => ({
                label: `${ITrickleKeys[i]}`,
                value: item,
            })),
            vTrickleFast: [...VTrickleFastValues].map((item, i) => ({
                label: `${VTrickleFastKeys[i]}`,
                value: item,
            })),
        };
    }
}
