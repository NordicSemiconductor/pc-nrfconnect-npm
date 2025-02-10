/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { POF, PofModule } from '../../types';
import pofCallbacks from './pofCallbacks';
import { PofGet } from './pofGetters';
import { PofSet } from './pofSetter';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements PofModule {
    private _get: PofGet;
    private _set: PofSet;
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
        this._get = new PofGet(sendCommand);
        this._set = new PofSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = pofCallbacks(shellParser, eventEmitter);
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
    get ranges(): { threshold: RangeType } {
        return {
            threshold: {
                min: 2.6,
                max: 3.5,
                decimals: 1,
                step: 0.1,
            },
        };
    }
    get defaults(): POF {
        return {
            enable: true,
            threshold: 2.8,
            polarity: 'Active high',
        };
    }
}
