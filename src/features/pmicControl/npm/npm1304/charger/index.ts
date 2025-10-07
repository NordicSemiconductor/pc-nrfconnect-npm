/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../../utils/helpers';
import nPM1300Charger from '../../npm1300/charger';
import chargerCallbacks from '../../npm1300/charger/callbacks';
import {
    VTrickleFastKeys,
    VTrickleFastValues,
} from '../../npm1300/charger/types';
import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Charger,
    ChargerModuleRanges,
    ModuleParams,
    VTrickleFast,
} from '../../types';
import { ChargerGet } from './getters';
import { ChargerSet } from './setters';
import { ITermKeys, ITermNpm1304, ITermValues } from './types';

export default class Module extends nPM1300Charger {
    constructor(parms: ModuleParams) {
        super(
            parms,
            (
                shellParser: ShellParser | undefined,
                eventEmitter: NpmEventEmitter,
            ) => chargerCallbacks(shellParser, eventEmitter, ITermValues),
            ChargerGet,
            ChargerSet,
        );
    }

    get defaults(): Charger {
        return {
            vTerm: this.ranges.voltage[0],
            vTrickleFast: 2.5,
            iChg: this.ranges.current.min,
            enabled: false,
            iTerm: 5,
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
                min: 4,
                max: 100,
                decimals: 1,
                step: 0.5,
            },
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
                min: 4,
                max: 500,
            },
        };
    }

    // eslint-disable-next-line class-methods-use-this
    protected get voltageRange() {
        return getRange([
            {
                min: 3.6,
                max: 3.65,
                step: 0.05,
            },
            {
                min: 4.0,
                max: 4.65,
                step: 0.05,
            },
        ]).map(v => Number(v.toFixed(2)));
    }

    // eslint-disable-next-line class-methods-use-this
    get values(): {
        iTerm: { label: string; value: ITermNpm1304 }[];
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
