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
    ChargerJeitaILabel,
    ChargerJeitaVLabel,
    type ChargerModule as ChargerModuleBase,
    ChargerModuleGet,
    ChargerModuleGetBase,
    ChargerModuleRanges,
    ChargerModuleSet,
    ChargerModuleSetBase,
    ChargerModuleValues,
    ITerm,
    ITrickle,
    ModuleParams,
} from '../../types';
import chargerCallbacks from './callbacks';
import { ChargerGet } from './getters';
import { ChargerSet } from './setters';
import {
    ITermKeys,
    ITermKeysWhenIChgBelow8mA,
    ITermValues,
    ITermValuesWhenIChgBelow8mA,
    ITrickleKeys,
    ITrickleKeysWhenIChgBelow8mA,
    ITrickleValues,
    ITrickleValuesWhenIChgBelow8mA,
    VTrickleFastKeys,
    VTrickleFastValues,
} from './types';

export default class Module implements ChargerModuleBase {
    private _get: ChargerModuleGetBase;
    private _set: ChargerModuleSetBase;
    private _callbacks: (() => void)[];
    private _ranges: ChargerModuleRanges;
    private _values: ChargerModuleValues;

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
        this._ranges = Module.getRanges();
        this._values = Module.getValues();
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
            iTerm: ITermValues[ITermValues.length / 2],
            iTrickle: ITrickleValues[ITrickleValues.length / 2],
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
            jeitaILabelCold: ChargerJeitaILabel.coldIOff,
            jeitaILabelCool: ChargerJeitaILabel.coolIChg50percent,
            jeitaILabelNominal: ChargerJeitaILabel.nominalIChg,
            jeitaILabelWarm: ChargerJeitaILabel.warmIChg,
            jeitaILabelHot: ChargerJeitaILabel.hotIOff,
            jeitaVLabelCold: ChargerJeitaVLabel.coldVNA,
            jeitaVLabelCool: ChargerJeitaVLabel.coolVTerm,
            jeitaVLabelNominal: ChargerJeitaVLabel.nominalVTerm,
            jeitaVLabelWarm: ChargerJeitaVLabel.warmVTerm100mVOff,
            jeitaVLabelHot: ChargerJeitaVLabel.hotVNA,
        };
    }

    get values(): ChargerModuleValues {
        return this._values;
    }

    get ranges(): ChargerModuleRanges {
        return this._ranges;
    }

    protected static getRanges(): ChargerModuleRanges {
        return {
            voltage: Module.voltageRange,
            vTermR: Module.voltageRange,
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

    protected static getValues(): ChargerModuleValues {
        const getITermValues = (
            iChg: number,
        ): { label: string; value: ITerm }[] => {
            if (iChg < 8) {
                return ITermValuesWhenIChgBelow8mA.map((item, i) => ({
                    label: `${ITermKeysWhenIChgBelow8mA[i]}`,
                    value: item,
                }));
            }
            return ITermValues.map((item, i) => ({
                label: `${ITermKeys[i]}`,
                value: item,
            }));
        };

        const getITrickleValues = (
            iChg: number,
        ): { label: string; value: ITrickle }[] => {
            if (iChg < 8) {
                return ITrickleValuesWhenIChgBelow8mA.map((item, i) => ({
                    label: `${ITrickleKeysWhenIChgBelow8mA[i]}`,
                    value: item,
                }));
            }
            return ITrickleValues.map((item, i) => ({
                label: `${ITrickleKeys[i]}`,
                value: item,
            }));
        };

        return {
            iTerm: getITermValues,
            iTrickle: getITrickleValues,
            vTrickleFast: [...VTrickleFastValues].map((item, i) => ({
                label: `${VTrickleFastKeys[i]}`,
                value: item,
            })),
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

    protected static get voltageRange() {
        return getRange([
            {
                min: 3.5,
                max: 4.65,
                step: 0.01,
                decimals: 2,
            },
        ]).map(v => Number(v.toFixed(2)));
    }
}
