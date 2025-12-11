/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
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
    FixedListRange,
    ITerm,
    ModuleParams,
    VTrickleFast,
} from '../../types';
import chargerCallbacks from './callbacks';
import { ChargerGet } from './getters';
import { ChargerSet } from './setters';
import {
    ITermKeys,
    ITermValues,
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
            iBatLim: 1000,
            enableRecharging: false,
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
            current: {
                min: 32,
                max: 800,
                decimals: 0,
                step: 2,
            },
            nTCBeta: {
                min: 0,
                max: 4294967295,
                decimals: 0,
                step: 1,
            },
            iBatLim: Module.iBatRange(),
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
        };
    }

    static iBatRange(): FixedListRange {
        const result: number[] & { toLabel?: (v: number) => string } = [
            1000, 200,
        ];
        result.toLabel = (v: number) => {
            switch (v) {
                case 1000:
                    return 'High';
                case 200:
                    return 'Low';
                default:
                    return `Manual (${v} mA)`;
            }
        };

        return result;
    }

    // eslint-disable-next-line class-methods-use-this
    protected get voltageRange() {
        return getRange([
            {
                min: 3.5,
                max: 3.65,
                step: 0.05,
            },
            {
                min: 4.0,
                max: 4.45,
                step: 0.05,
            },
        ]).map(v => Number(v.toFixed(2)));
    }

    // eslint-disable-next-line class-methods-use-this
    get values(): {
        iTerm: { label: string; value: ITerm }[];
        vTrickleFast: { label: string; value: VTrickleFast }[];
    } {
        return {
            iTerm: [...ITermValues].map((item, i) => ({
                label: `${ITermKeys[i]}`,
                value: item,
            })),
            vTrickleFast: [...VTrickleFastValues].map((item, i) => ({
                label: `${VTrickleFastKeys[i]}`,
                value: item,
            })),
        };
    }
}
