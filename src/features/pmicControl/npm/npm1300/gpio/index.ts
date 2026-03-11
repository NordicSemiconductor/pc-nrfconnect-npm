/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type GPIO,
    type GPIODrive,
    type GPIOMode,
    type GpioModule,
    type GPIOPull,
    type ModuleParams,
} from '../../types';
import gpioCallbacks from './callbacks';
import { GpioGet } from './getters';
import { GpioSet } from './setters';
import {
    GPIODriveKeys,
    GPIODriveValues,
    GPIOMode1300,
    GPIOModeKeys,
    GPIOModeValues,
    GPIOPull1300,
    GPIOPullKeys,
    GPIOPullValues,
} from './types';

/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */

export default class Module implements GpioModule {
    readonly index: number;
    private _get: GpioGet;
    private _set: GpioSet;
    private _callbacks: (() => void)[];
    constructor({
        index,
        sendCommand,
        eventEmitter,
        offlineMode,
        shellParser,
    }: ModuleParams) {
        this.index = index;
        this._get = new GpioGet(sendCommand, index);
        this._set = new GpioSet(eventEmitter, sendCommand, offlineMode, index);
        this._callbacks = gpioCallbacks(shellParser, eventEmitter, index);
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

    get values(): {
        mode: { label: string; value: GPIOMode }[];
        pull: { label: string; value: GPIOPull }[];
        drive: { label: string; value: GPIODrive }[];
    } {
        return {
            mode: [...GPIOModeValues].map((item, i) => ({
                label: `${GPIOModeKeys[i]}`,
                value: item,
            })),
            pull: [...GPIOPullValues].map((item, i) => ({
                label: `${GPIOPullKeys[i]}`,
                value: item,
            })),
            drive: [...GPIODriveValues].map((item, i) => ({
                label: `${GPIODriveKeys[i]}`,
                value: item,
            })),
        };
    }
    get defaults(): GPIO {
        return {
            mode: GPIOMode1300.Input,
            pull: GPIOPull1300['Pull up'],
            pullEnabled: true,
            drive: 1,
            driveEnabled: false,
            openDrain: false,
            openDrainEnabled: true,
            debounce: false,
            debounceEnabled: true,
        };
    }
}
