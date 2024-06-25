/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    GPIODriveKeys,
    GPIOModeKeys,
    GPIOPullKeys,
} from '../../npm2100/gpio/types';
import { NpmEventEmitter } from '../../pmicHelpers';
import { GpioModule } from '../../types';
import gpioCallbacks from './gpioCallbacks';
import { GpioGet } from './gpioGetters';
import { GpioSet } from './gpioSetters';
import {
    GPIODriveValues,
    GPIOMode1300,
    GPIOModeValues,
    GPIOPull1300,
    GPIOPullValues,
} from './types';

export const numberOfGPIOs = 5;

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): GpioModule[] =>
    [...Array(numberOfGPIOs).keys()].map(index => ({
        index,
        get: new GpioGet(sendCommand, index),
        set: new GpioSet(eventEmitter, sendCommand, offlineMode, index),
        callbacks: gpioCallbacks(shellParser, eventEmitter, numberOfGPIOs),
        values: {
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
        },
        defaults: {
            mode: GPIOMode1300.Input,
            pull: GPIOPull1300['Pull up'],
            drive: 1,
            openDrain: false,
            debounce: false,
        },
    }));
