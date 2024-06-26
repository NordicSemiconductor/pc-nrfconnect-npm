/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
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
import { GpioGet } from './gpioGetters';

export class GpioSet {
    private get: GpioGet;
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean,
        private index: number
    ) {
        this.get = new GpioGet(sendCommand, index);
    }

    async all(gpio: GPIO) {
        await this.mode(gpio.mode);
        await this.pull(gpio.pull);
        await this.drive(gpio.drive);
        await this.openDrain(gpio.openDrain);
        await this.debounce(gpio.debounce);
    }

    mode(mode: GPIOMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        mode,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config mode set ${
                        this.index
                    } ${GPIOModeValues.findIndex(m => m === mode)}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    }
                );
            }
        });
    }

    pull(pull: GPIOPullMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        pull,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config pull set ${
                        this.index
                    } ${GPIOPullValues.findIndex(p => p === pull)}`,
                    () => resolve(),
                    () => {
                        this.get.pull();
                        reject();
                    }
                );
            }
        });
    }

    drive(drive: GPIODrive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        drive,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config drive set ${this.index} ${drive}`,
                    () => resolve(),
                    () => {
                        this.get.drive();
                        reject();
                    }
                );
            }
        });
    }

    openDrain(openDrain: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        openDrain,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config open_drain set ${this.index} ${
                        openDrain ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.openDrain();
                        reject();
                    }
                );
            }
        });
    }

    debounce(debounce: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        debounce,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config debounce set ${this.index} ${
                        debounce ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.debounce();
                        reject();
                    }
                );
            }
        });
    }
}
