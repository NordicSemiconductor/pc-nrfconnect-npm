/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { BatteryModule } from '../../types';
import batteryCallbacks from './batteryCallbacks';
import { BatteryGet } from './BatteryGet';

/* eslint-disable no-underscore-dangle */

export type PowerID2100 = 'VEXT' | 'VBAT';

export default class Module implements BatteryModule {
    private _get: BatteryGet;
    private _callbacks: (() => void)[];
    constructor(
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {
        this._get = new BatteryGet(sendCommand);
        this._callbacks = batteryCallbacks(shellParser, eventEmitter);
    }

    get get() {
        return this._get;
    }
    get callbacks() {
        return this._callbacks;
    }
}
