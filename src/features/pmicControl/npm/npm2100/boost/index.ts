/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Boost, BoostModule } from '../../types';
import boostCallbacks from './callbacks';
import { BoostGet } from './getters';
import { BoostSet } from './setters';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

const boostDefaults = (): Boost => ({
    vOutSoftware: voltageRange().min,
    vOutVSet: voltageRange().min,
    vOutSelect: 'Vset',
    modeControl: 'AUTO',
    pinSelection: 'OFF',
    pinMode: 'HP',
    pinModeEnabled: false,
    overCurrentProtection: false,
});

const voltageRange = () =>
    ({
        min: 1.8,
        max: 3.3,
        decimals: 1,
    } as RangeType);

export default class Module implements BoostModule {
    private _get: BoostGet;
    private _set: BoostSet;
    private _callbacks: (() => void)[];
    constructor(
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        offlineMode: boolean,
        readonly index = 0
    ) {
        this._get = new BoostGet(sendCommand);
        this._set = new BoostSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = boostCallbacks(shellParser, eventEmitter);
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
    get ranges(): {
        voltage: RangeType;
    } {
        return {
            voltage: voltageRange(),
        };
    }
    get defaults(): Boost {
        return boostDefaults();
    }
}
