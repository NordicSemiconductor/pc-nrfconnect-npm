/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */
import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Charger,
    type ChargerModule as ChargerModuleBase,
    FixedListRange,
} from '../../types';
import chargerCallbacks from './chargerCallbacks';
import { ChargerGet } from './chargerGetters';
import { ChargerSet } from './chargerSetters';

export class ChargerModule implements ChargerModuleBase {
    private _get: ChargerGet;
    private _set: ChargerSet;
    private _callbacks: ReturnType<typeof chargerCallbacks>;

    constructor(
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        offlineMode: boolean
    ) {
        this._get = new ChargerGet(sendCommand);
        this._set = new ChargerSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = chargerCallbacks(shellParser, eventEmitter);
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

    // eslint-disable-next-line class-methods-use-this
    get ranges() {
        return {
            voltage: ChargerModule.voltageRange,
            vTermR: ChargerModule.voltageRange,
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
            iBatLim: ChargerModule.iBatRange(),
        };
    }

    static iBatRange(): FixedListRange {
        const result: number[] & { toLabel?: (v: number) => string } = [
            1340, 270,
        ];
        result.toLabel = (v: number) => {
            switch (v) {
                case 1340:
                    return 'High';
                case 270:
                    return 'Low';
                default:
                    return `Manual (${v} mA)`;
            }
        };

        return result;
    }

    private static get voltageRange() {
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
}
