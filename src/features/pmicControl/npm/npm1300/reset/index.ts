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
    LongPressResetValues,
    ResetConfig,
    ResetModule,
    ResetPinSelection,
} from '../../types';
import resetCallbacks from './resetCallbacks';
import { ResetGet } from './resetGetters';
import { ResetSet } from './resetSetters';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements ResetModule {
    private _get: ResetGet;
    private _set: ResetSet;
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
        this._callbacks = resetCallbacks(shellParser, eventEmitter);
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
    get actions(): { powerCycle?: () => Promise<void> } {
        return {};
    }
    get values(): {
        pinSelection: DropdownItem<ResetPinSelection>[];
        longPressReset: DropdownItem<LongPressReset>[];
        longPressResetDebounce: DropdownItem<LongPressResetDebounce>[];
    } {
        return {
            longPressReset: LongPressResetValues.map(item => ({
                label: `${item}`.replaceAll('_', ' '),
                value: `${item}`,
            })),
            pinSelection: [],
            longPressResetDebounce: [],
        };
    }
    get defaults(): ResetConfig {
        return {
            longPressReset: 'one_button',
        };
    }
}
