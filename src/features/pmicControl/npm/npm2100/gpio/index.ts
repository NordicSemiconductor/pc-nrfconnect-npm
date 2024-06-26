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
import {
    GPIODrive2100,
    GPIODriveKeys,
    GPIOMode2100,
    GPIOModeKeys,
    GPIOPull2100,
    GPIOPullKeys,
} from './types';

export const numberOfGPIOs = 2;

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
        },
        defaults: {
            mode: GPIOMode2100.Input,
            pull: GPIOPull2100['Pull up'],
            pullEnabled: true,
            drive: GPIODrive2100.High,
            driveEnabled: false,
            openDrain: false,
            openDrainEnabled: false,
            debounce: false,
            debounceEnabled: true,
        },
    }));
