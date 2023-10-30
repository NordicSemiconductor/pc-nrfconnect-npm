/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive,
    GPIOMode,
    GPIOModeValues,
    GPIOPullMode,
    GPIOPullValues,
} from '../../types';

export const gpioGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    gpioMode: (index: number) => sendCommand(`npmx gpio mode get ${index}`),
    gpioPull: (index: number) => sendCommand(`npmx gpio pull get ${index}`),
    gpioDrive: (index: number) => sendCommand(`npmx gpio drive get ${index}`),
    gpioOpenDrain: (index: number) =>
        sendCommand(`npmx gpio open_drain get ${index}`),
    gpioDebounce: (index: number) =>
        sendCommand(`npmx gpio debounce get ${index}`),
});

export const gpioSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const { gpioMode, gpioPull, gpioDrive, gpioOpenDrain, gpioDebounce } =
        gpioGet(sendCommand);

    const setGpioMode = (index: number, mode: GPIOMode) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        mode,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio mode set ${index} ${GPIOModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        gpioMode(index);
                        reject();
                    }
                );
            }
        });

    const setGpioPull = (index: number, pull: GPIOPullMode) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        pull,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio pull set ${index} ${GPIOPullValues.findIndex(
                        p => p === pull
                    )}`,
                    () => resolve(),
                    () => {
                        gpioPull(index);
                        reject();
                    }
                );
            }
        });

    const setGpioDrive = (index: number, drive: GPIODrive) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        drive,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio drive set ${index} ${drive}`,
                    () => resolve(),
                    () => {
                        gpioDrive(index);
                        reject();
                    }
                );
            }
        });

    const setGpioOpenDrain = (index: number, openDrain: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        openDrain,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio open_drain set ${index} ${
                        openDrain ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        gpioOpenDrain(index);
                        reject();
                    }
                );
            }
        });

    const setGpioDebounce = (index: number, debounce: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        debounce,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx gpio debounce set ${index} ${debounce ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        gpioDebounce(index);
                        reject();
                    }
                );
            }
        });

    return {
        setGpioMode,
        setGpioPull,
        setGpioDrive,
        setGpioOpenDrain,
        setGpioDebounce,
    };
};
