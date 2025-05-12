/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getRange } from '../../../../../utils/helpers';
import nPM1300Charger from '../../npm1300/charger';
import { Charger } from '../../types';

export default class Module extends nPM1300Charger {
    get defaults(): Charger {
        return {
            vTerm: this.ranges.voltage[0],
            vTrickleFast: 2.5,
            iChg: this.ranges.current.min,
            enabled: false,
            iTerm: '10%',
            iBatLim: 1340,
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

    get ranges() {
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
            iBatLim: Module.iBatRange(),
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
}
