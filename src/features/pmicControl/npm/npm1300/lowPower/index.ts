/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type LowPowerConfig,
    type LowPowerModule,
    type ModuleParams,
    npm1300TimeToActive,
    type TimeToActive,
} from '../../types';
import { LowPowerActions } from './actions';
import shipModeCallbacks from './callbacks';
import { LowPowerGet } from './getters';
import { LowPowerSet } from './setters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements LowPowerModule {
    private _get: LowPowerGet;
    private _set: LowPowerSet;
    private _actions: LowPowerActions;
    private _callbacks: (() => void)[];

    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._get = new LowPowerGet(sendCommand);
        this._set = new LowPowerSet(eventEmitter, sendCommand, offlineMode);
        this._actions = new LowPowerActions(
            eventEmitter,
            sendCommand,
            offlineMode,
        );
        this._callbacks = shipModeCallbacks(shellParser, eventEmitter);
    }

    get get() {
        return this._get;
    }
    get set() {
        return this._set;
    }
    get actions() {
        return this._actions;
    }
    get callbacks() {
        return this._callbacks;
    }
    get defaults(): LowPowerConfig {
        return {
            timeToActive: npm1300TimeToActive['96ms'],
            invPolarity: true,
        };
    }
    get values(): { timeToActive: { label: string; value: TimeToActive }[] } {
        return {
            timeToActive: Object.keys(npm1300TimeToActive).map(key => ({
                label: `${key}`,
                value: npm1300TimeToActive[
                    key as keyof typeof npm1300TimeToActive
                ],
            })),
        };
    }
}
