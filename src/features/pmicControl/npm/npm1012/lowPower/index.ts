/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type LowPowerConfig,
    type LowPowerExport,
    type LowPowerModule,
    type ModuleParams,
} from '../../types';
import { LowPowerActions } from './actions';
import shipModeCallbacks from './callbacks';
import { LowPowerGet } from './getters';
import { LowPowerSet } from './setters';
import { timeToActiveKeys, timeToActiveValues } from './types';

export const toLowPowerExport = (config: LowPowerConfig): LowPowerExport => ({
    hibernateWakeupByButton: config.hibernateWakeupByButton,
    timeToActive: config.timeToActive,
    vbusHibernateWait: config.vbusHibernateWait,
    vbusStandbyWait: config.vbusStandbyWait,
});

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements LowPowerModule {
    private _actions: LowPowerActions;
    private _callbacks: (() => void)[];
    private _get: LowPowerGet;
    private _set: LowPowerSet;

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._actions = new LowPowerActions(
            eventEmitter,
            sendCommand,
            offlineMode,
        );
        this._callbacks = shipModeCallbacks(shellParser, eventEmitter);
        this._get = new LowPowerGet(sendCommand);
        this._set = new LowPowerSet(eventEmitter, sendCommand, offlineMode);
    }

    get actions() {
        return this._actions;
    }

    get callbacks() {
        return this._callbacks;
    }

    get defaults(): LowPowerConfig {
        return {
            hibernateWakeupByButton: false,
            operatingMode: 'active',
            timeToActive: 'OFF',
            vbusHibernateWait: false,
            vbusHibernateWaitingForChargeComplete: false,
            vbusStandbyWait: false,
            vbusStandbyWaitingForChargeComplete: false,
        };
    }

    get get() {
        return this._get;
    }

    get set() {
        return this._set;
    }

    get values(): LowPowerModule['values'] {
        return {
            timeToActive: timeToActiveKeys.map((item, i) => ({
                label: timeToActiveValues[i],
                value: item,
            })),
        };
    }
}
