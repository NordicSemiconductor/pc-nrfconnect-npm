/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LowPowerConfig,
    LowPowerModule,
    ModuleParams,
    npm2100TimeToActive,
    TimeToActive,
} from '../../types';
import { LowPowerActions } from './lowPowerActions';
import shipModeCallbacks from './lowPowerCallbacks';
import { LowPowerGet } from './lowPowerGetters';
import { LowPowerSet } from './lowPowerSetters';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements LowPowerModule {
    private _get: LowPowerGet;
    private _set: LowPowerSet;
    private _actions: LowPowerActions;
    private _callbacks: (() => void)[];
    constructor({
        sendCommand,
        eventEmitter,
        shellParser,
        offlineMode,
        dialogHandler,
    }: ModuleParams) {
        this._get = new LowPowerGet(sendCommand);
        this._set = new LowPowerSet(eventEmitter, sendCommand, offlineMode);
        this._actions = new LowPowerActions(sendCommand, dialogHandler);
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
            timeToActive: npm2100TimeToActive['100ms'],
            powerButtonEnable: true,
        };
    }
    get values(): {
        timeToActive: { label: string; value: TimeToActive }[];
    } {
        return {
            timeToActive: Object.keys(npm2100TimeToActive).map(key => ({
                label: `${key}`,
                value: npm2100TimeToActive[
                    key as keyof typeof npm2100TimeToActive
                ],
            })),
        };
    }
}
