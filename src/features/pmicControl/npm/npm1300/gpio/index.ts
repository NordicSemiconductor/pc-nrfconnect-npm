/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { GpioModule } from '../../types';
import gpioCallbacks from './gpioCallbacks';
import { GpioGet } from './gpioGetters';
import { GpioSet } from './gpioSetters';

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
        defaults: {
            mode: 'Input',
            pull: 'Pull up',
            drive: 1,
            openDrain: false,
            debounce: false,
        },
    }));
