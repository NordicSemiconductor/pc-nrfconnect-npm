/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive,
    GPIOMode,
    type GpioModule,
    GPIOPull,
    PmicDialog,
} from '../../types';
import gpioCallbacks from './gpioCallbacks';
import { GpioGet } from './gpioGetters';
import { GpioSet } from './gpioSetters';
import {
    GPIODrive2100,
    GPIODriveKeys,
    GPIOMode2100,
    GPIOModeKeys,
    GPIOPull2100,
    GPIOPullKeys,
} from './types';

/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */

export default class Module implements GpioModule {
    private _get: GpioGet;
    private _set: GpioSet;
    private _callbacks: (() => void)[];
    constructor(
        readonly index: number,
        shellParser: ShellParser | undefined,
        eventEmitter: NpmEventEmitter,
        sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        dialogHandler: ((dialog: PmicDialog) => void) | null,
        offlineMode: boolean
    ) {
        this._get = new GpioGet(sendCommand, index);
        this._set = new GpioSet(
            eventEmitter,
            sendCommand,
            offlineMode,
            dialogHandler,
            index
        );
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
            mode: [...GPIOModeKeys].map(item => ({
                label: `${item}`,
                value: GPIOMode2100[item as keyof typeof GPIOMode2100],
            })),
            pull: [...GPIOPullKeys].map(item => ({
                label: `${item}`,
                value: GPIOPull2100[item as keyof typeof GPIOPull2100],
            })),
            drive: [...GPIODriveKeys].map(item => ({
                label: `${item}`,
                value: GPIODrive2100[item as keyof typeof GPIODrive2100],
            })),
        };
    }

    get defaults(): GPIO {
        return {
            mode: GPIOMode2100.Input,
            pull: GPIOPull2100['Pull up'],
            pullEnabled: true,
            drive: GPIODrive2100.High,
            driveEnabled: true,
            openDrain: false,
            openDrainEnabled: false,
            debounce: false,
            debounceEnabled: true,
        };
    }
}
