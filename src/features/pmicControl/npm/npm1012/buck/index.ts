/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import {
    Buck,
    BuckExport,
    BuckMode,
    BuckModeControl,
    BuckModule,
    ModuleParams,
} from '../../types';
import buckCallbacks from './callbacks';
import { BuckGet } from './getters';
import { BuckSet } from './setters';
import {
    BuckAlternateVOutControlValues1012,
    BuckModeControl1012,
    BuckModeControlValues1012,
    BuckOnOffControlValues1012,
    BuckVOutRippleControlValues1012,
} from './types';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

const buckDefaults = (): Buck => ({
    vOutNormal: buckVoltageRange().min,
    mode: 'vSet',
    enabled: true,
    modeControl: 'LP' as BuckModeControl1012,
    onOffControl: 'Off',
    onOffSoftwareControlEnabled: true,
    retentionControl: 'Off',
    activeDischarge: false,
    cardLabel: 'BUCK',
    vSetLabel: 'Vset',

    activeDischargeResistance: 0,
    alternateVOut: buckVoltageRange().min,
    alternateVOutControl: 'Off',
    automaticPassthrough: false,
    peakCurrentLimit: peakCurrentLimitValues[0],
    quickVOutDischarge: false,
    shortCircuitProtection: false,
    softStartPeakCurrentLimit: softStartPeakCurrentLimitValues[0],
    vOutComparatorBiasCurrentLPMode: vOutComparatorBiasCurrentLPModeValues[0],
    vOutComparatorBiasCurrentULPMode: vOutComparatorBiasCurrentULPModeValues[0],
    vOutRippleControl: 'Nominal',
});

export const toBuckExport = (buck: Buck): BuckExport => ({
    vOutNormal: buck.vOutNormal,
    mode: buck.mode,
    modeControl: buck.modeControl,
    onOffControl: buck.onOffControl,
    retentionControl: buck.retentionControl,
    enabled: buck.enabled,
    activeDischarge: buck.activeDischarge,

    activeDischargeResistance: buck.activeDischargeResistance,
    alternateVOut: buck.alternateVOut,
    alternateVOutControl: buck.alternateVOutControl,
    automaticPassthrough: buck.automaticPassthrough,
    peakCurrentLimit: buck.peakCurrentLimit,
    quickVOutDischarge: buck.quickVOutDischarge,
    shortCircuitProtection: buck.shortCircuitProtection,
    softStartPeakCurrentLimit: buck.softStartPeakCurrentLimit,
    vOutComparatorBiasCurrentLPMode: buck.vOutComparatorBiasCurrentLPMode,
    vOutComparatorBiasCurrentULPMode: buck.vOutComparatorBiasCurrentULPMode,
    vOutRippleControl: buck.vOutRippleControl,
});

const buckVoltageRange = () =>
    ({
        decimals: 2,
        max: 3.3,
        min: 1,
        step: 0.05,
    }) as RangeType;

const activeDischargeResistanceValues = [
    0, 250, 500, 1000, 2000,
] as readonly number[];

const peakCurrentLimitValues = [
    66, 91, 117, 142, 167, 192, 217, 291,
] as readonly number[];

const softStartPeakCurrentLimitValues = [
    66, 91, 117, 142, 167, 192, 217, 291,
] as readonly number[];

const vOutComparatorBiasCurrentLPModeValues = [
    0.8, 1.4, 2.5, 3.0,
] as readonly number[];

const vOutComparatorBiasCurrentULPModeValues = [
    28, 35, 50, 95,
] as readonly number[];

export default class Module implements BuckModule {
    readonly index: number;
    private _get: BuckGet;
    private _set: BuckSet;
    private _callbacks: (() => void)[];
    constructor({
        index,
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this.index = index;
        this._get = new BuckGet(sendCommand);
        this._set = new BuckSet(eventEmitter, sendCommand, offlineMode, index);
        this._callbacks = buckCallbacks(shellParser, eventEmitter, index);
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

    get ranges(): BuckModule['ranges'] {
        return {
            voltage: buckVoltageRange(),
            alternateVOut: buckVoltageRange(),
        };
    }

    get values(): BuckModule['values'] {
        const onOffControlValues = (mode: BuckMode) => {
            let values = [];
            switch (mode) {
                case 'software': {
                    values = BuckOnOffControlValues1012.filter(
                        value => value !== 'VSET',
                    );
                    break;
                }
                case 'vSet': {
                    values = BuckOnOffControlValues1012.filter(
                        value => value !== 'Software',
                    );
                    break;
                }
            }

            return values.map(val => ({
                label: `${val}`,
                value: val,
            }));
        };

        const vOutComparatorBiasCurrentValues = (mode: BuckModeControl) => {
            const lpModeValues = vOutComparatorBiasCurrentLPModeValues.map(
                val => ({
                    label: `${val} uA`,
                    value: val,
                }),
            );
            const ulpModeValues = vOutComparatorBiasCurrentULPModeValues.map(
                val => ({
                    label: `${val} nA`,
                    value: val,
                }),
            );

            switch (mode) {
                case 'LP': {
                    return lpModeValues;
                }
                case 'ULP': {
                    return ulpModeValues;
                }
                default: {
                    return [{ label: 'N/A', value: 0 }];
                }
            }
        };

        return {
            activeDischargeResistance: activeDischargeResistanceValues.map(
                val => ({
                    label: val === 0 ? 'Off' : `${val} Ohm`,
                    value: val,
                }),
            ),
            alternateVOutControl: BuckAlternateVOutControlValues1012.map(
                val => ({
                    label: val,
                    value: val,
                }),
            ),
            modeControl: BuckModeControlValues1012.map(val => ({
                label: `${val}`,
                value: val,
            })),
            onOffControl: onOffControlValues,
            peakCurrentLimit: peakCurrentLimitValues.map(val => ({
                label: `${val} mA`,
                value: val,
            })),
            softStartPeakCurrentLimit: softStartPeakCurrentLimitValues.map(
                val => ({
                    label: `${val} mA`,
                    value: val,
                }),
            ),
            vOutComparatorBiasCurrent: vOutComparatorBiasCurrentValues,
            vOutRippleControl: BuckVOutRippleControlValues1012.map(val => ({
                label: val,
                value: val,
            })),
        };
    }

    get defaults(): Buck {
        return buckDefaults();
    }
}
