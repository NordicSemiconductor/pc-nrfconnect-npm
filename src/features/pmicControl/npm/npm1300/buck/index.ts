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
    BuckModeControlValues,
    BuckModule,
    BuckOnOffControl,
    BuckRetentionControlValues,
    GPIOValues,
    ModuleParams,
} from '../../types';
import { numGPIOs } from '../gpio/types';
import buckCallbacks from './callbacks';
import { BuckGet } from './getters';
import { BuckSet } from './setters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

const buckDefaults = (index: number): Buck => ({
    vOutNormal: buckVoltageRange().min,
    vOutRetention: 1,
    mode: 'vSet',
    enabled: true,
    modeControl: 'Auto',
    onOffControl: 'Off',
    onOffSoftwareControlEnabled: true,
    retentionControl: 'Off',
    activeDischarge: false,
    cardLabel: `BUCK ${index + 1}`,
    vSetLabel: `Vset${index + 1}`,
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
    }) as RangeType;

const buckRetVOutRange = () =>
    ({
        min: 1,
        max: 3,
        decimals: 1,
    }) as RangeType;

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
            index,
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

    get values() {
        const gpioNames = GPIOValues.slice(0, numGPIOs);

        const onOffControlForBuckMode = (mode: BuckMode): BuckOnOffControl =>
            mode === 'software'
                ? 'Software'
                : (`VSET${this.index + 1}` as BuckOnOffControl);

        return {
            modeControl: [...BuckModeControlValues, ...gpioNames].map(item => ({
                label: item,
                value: item,
            })),
            onOffControl: (mode: BuckMode) =>
                [onOffControlForBuckMode(mode), ...gpioNames].map(item => ({
                    label: item,
                    value: item,
                })),
            retentionControl: [...BuckRetentionControlValues, ...gpioNames].map(
                item => ({
                    label: item,
                    value: item,
                }),
            ),
        };
    }

    get defaults(): Buck {
        return buckDefaults(this.index);
    }
}
