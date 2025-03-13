/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DropdownItem,
    ShellParser,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    LongPressReset,
    LongPressResetDebounce,
    ResetConfig,
    ResetModule,
    ResetPinSelection,
} from '../../types';
import {
    npm2100LongPressResetDebounceValues,
    npm2100ResetPinSelection,
} from '../types';
import { ResetActions } from './resetActions';
import resetCallbacks from './resetCallbacks';
import { ResetGet } from './resetGetters';
import { ResetSet } from './resetSetters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements ResetModule {
    private _get: ResetGet;
    private _set: ResetSet;
    private _actions: ResetActions;
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
        this._get = new ResetGet(sendCommand);
        this._set = new ResetSet(eventEmitter, sendCommand, offlineMode);
        this._actions = new ResetActions(
            eventEmitter,
            sendCommand,
            offlineMode
        );
        this._callbacks = resetCallbacks(shellParser, eventEmitter);
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
    get values(): {
        pinSelection: DropdownItem<ResetPinSelection>[];
        longPressReset: DropdownItem<LongPressReset>[];
        longPressResetDebounce: DropdownItem<LongPressResetDebounce>[];
    } {
        return {
            pinSelection: Object.keys(npm2100ResetPinSelection).map(key => ({
                label: `${key}`,
                value: npm2100ResetPinSelection[
                    key as keyof typeof npm2100ResetPinSelection
                ],
            })),
            longPressResetDebounce: npm2100LongPressResetDebounceValues.map(
                item => ({
                    label: `${item}`,
                    value: `${item}`,
                })
            ),
            longPressReset: [],
        };
    }
    get defaults(): ResetConfig {
        return {
            longPressResetEnable: false,
            longPressResetDebounce: '5s',
            resetPinSelection: npm2100ResetPinSelection['PG/RESET'],
        };
    }
}

// Mapping from reset reason code to description
export const ResetReasons = new Map<string, string>([
    ['Unknown', 'Unknown reason'],
    ['ColdPwrUp', 'Cold power up'],
    ['TSD', 'Thermal shutdown'],
    ['BootMonit', 'Boot monitor'],
    ['Button', 'Long press reset button'],
    ['WdRst', 'Watchdog reset'],
    ['WdPwrCycle', 'Watchdog power cycle'],
    ['SwReset', 'Software reset task'],
    ['HiberPin', 'SHPHLD pin exit from HIBERNATE mode'],
    ['HiberTimer', 'Timer exit from HIBERNATE mode'],
    ['HiberPtPin', 'SHPHLD pin exit from HIBERNATE_PT mode'],
    ['HiberPtTimer', 'Timer exit from HIBERNATE_PT mode'],
    ['PowerOffButton', 'PowerOffButton'],
    ['ShipExit', 'Exit from SHIP mode'],
    ['OCP', 'Overcurrent protection (OCP)'],
]);
