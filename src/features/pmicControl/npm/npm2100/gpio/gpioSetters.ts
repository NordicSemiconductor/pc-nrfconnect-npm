/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive as GPIODriveBase,
    GPIOMode as GPIOModeBase,
    GPIOPull as GPIOPullModeBase,
} from '../../types';
import { GpioGet } from './gpioGetters';
import { GPIOMode2100 } from './types';

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
        await this.mode(gpio.mode as GPIOMode2100);
        await this.pull(gpio.pull);
        await this.drive(gpio.drive);
        await this.openDrain(gpio.openDrain);
        await this.debounce(gpio.debounce);
    }

    mode(mode: GPIOModeBase) {
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
                    `npm2100 gpio mode set ${this.index} ${mode}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    }
                );
            }
        });
    }

    pull(pull: GPIOPullModeBase) {
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
                    `npm2100 gpio pull set ${this.index} ${pull}`,
                    () => resolve(),
                    () => {
                        this.get.pull();
                        reject();
                    }
                );
            }
        });
    }

    drive(drive: GPIODriveBase) {
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
                    `npm2100 gpio drive set ${this.index} ${drive}`,
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
                    `npm2100 gpio opendrain set ${this.index} ${
                        openDrain ? 'ON' : 'OFF'
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
                    `npm2100 gpio debounce set ${this.index} ${
                        debounce ? 'ON' : 'OFF'
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
