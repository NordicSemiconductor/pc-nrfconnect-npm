/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    LowPowerConfig,
    LowPowerModule,
    npm1300TimeToActive,
    TimeToActive,
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
        this._get = new LowPowerGet(sendCommand);
        this._set = new LowPowerSet(eventEmitter, sendCommand, offlineMode);
        this._actions = new LowPowerActions(
            eventEmitter,
            sendCommand,
            offlineMode
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
