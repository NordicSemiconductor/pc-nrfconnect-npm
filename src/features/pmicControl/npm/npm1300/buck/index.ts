/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../../../utils/helpers';
import { Buck, BuckExport, BuckModule, ModuleParams } from '../../types';
import buckCallbacks from './callbacks';
import { BuckGet } from './getters';
import { BuckSet } from './setters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

const buckDefaults = (): Buck => ({
    vOutNormal: buckVoltageRange().min,
    vOutRetention: 1,
    mode: 'vSet',
    enabled: true,
    modeControl: 'Auto',
    onOffControl: 'Off',
    onOffSoftwareControlEnabled: true,
    retentionControl: 'Off',
    activeDischarge: false,
});

export const toBuckExport = (buck: Buck): BuckExport => ({
    vOutNormal: buck.vOutNormal,
    vOutRetention: buck.vOutRetention,
    mode: buck.mode,
    modeControl: buck.modeControl,
    onOffControl: buck.onOffControl,
    retentionControl: buck.retentionControl,
    enabled: buck.enabled,
    activeDischarge: buck.activeDischarge,
});

const buckVoltageRange = () =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
    } as RangeType);

const buckRetVOutRange = () =>
    ({
        min: 1,
        max: 3,
        decimals: 1,
    } as RangeType);

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
        dialogHandler,
    }: ModuleParams) {
        this.index = index;
        this._get = new BuckGet(sendCommand, index);
        this._set = new BuckSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode,
            index
        );
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

    get ranges(): {
        voltage: RangeType;
        retVOut: RangeType;
    } {
        return {
            voltage: buckVoltageRange(),
            retVOut: buckRetVOutRange(),
        };
    }
    get defaults(): Buck {
        return buckDefaults();
    }
}
