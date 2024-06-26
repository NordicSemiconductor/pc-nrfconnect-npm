/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive,
    GPIOExport,
    GPIOMode as GPIOModeBase,
    GPIOPull as GPIOPullModeBase,
} from '../../types';
import { GpioGet } from './gpioGetters';
import { GPIOMode1300, GPIOModeKeys, GPIOModeValues } from './types';

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

    async all(gpio: GPIOExport) {
        await this.mode(gpio.mode as GPIOMode1300);
        await this.pull(gpio.pull);
        await this.drive(gpio.drive);
        await this.openDrain(gpio.openDrain);
        await this.debounce(gpio.debounce);
    }

    mode(mode: GPIOModeBase) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                const valueIndex = GPIOModeValues.findIndex(v => v === mode);
                const isInput = GPIOModeKeys[valueIndex]
                    .toString()
                    .startsWith('Input');
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        mode,
                        pullEnabled: isInput,
                        driveEnabled: !isInput,
                        debounceEnabled: isInput,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx gpio config mode set ${this.index} ${mode}`,
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
                    `npmx gpio config pull set ${this.index} ${pull}`,
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
