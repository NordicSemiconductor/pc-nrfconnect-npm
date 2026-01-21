/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type RangeType } from '../../../../../utils/helpers';
import {
    type ModuleParams,
    type OnBoardLoad,
    type OnBoardLoadModule,
} from '../../types';
import ldoCallbacks from './callbacks';
import { OnBoardLoadGet } from './getters';
import { OnBoardLoadSet } from './setters';

const onBoardLoadDefaults = (): OnBoardLoad => ({
    iLoad: 0,
});

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
export default class Module implements OnBoardLoadModule {
    private _get: OnBoardLoadGet;
    private _set: OnBoardLoadSet;
    private _callbacks: (() => void)[];
    constructor({
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this._get = new OnBoardLoadGet(sendCommand);
        this._set = new OnBoardLoadSet(eventEmitter, sendCommand, offlineMode);
        this._callbacks = ldoCallbacks(shellParser, eventEmitter);
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

    get ranges(): { iLoad: RangeType } {
        return {
            iLoad: {
                min: 0,
                max: 99,
                decimals: 2,
                step: 0.01,
            },
        };
    }
    get defaults(): OnBoardLoad {
        return onBoardLoadDefaults();
    }
}
