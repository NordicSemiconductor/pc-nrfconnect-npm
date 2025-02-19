/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive as GPIODriveBase,
    GPIOExport,
    GPIOMode as GPIOModeBase,
    GPIOPull as GPIOPullModeBase,
    PmicDialog,
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
        private dialogHandler: ((dialog: PmicDialog) => void) | null,
        private index: number
    ) {
        this.get = new GpioGet(sendCommand, index);
    }

    async all(gpio: GPIOExport) {
        // needed as some of the other properties cannot be set while GPIO is not output.
        // Hence we set it to output set the others and the set the intended gpio mode
        await this.mode(GPIOMode2100.Output);
        await this.pull(gpio.pull);
        await this.drive(gpio.drive);
        await this.openDrain(gpio.openDrain);
        await this.debounce(gpio.debounce);
        await this.mode(gpio.mode as GPIOMode2100);
    }

    mode(mode: GPIOModeBase) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    const isOutput = mode === GPIOMode2100.Output;
                    const isInterrupt =
                        mode ===
                            GPIOMode2100['Interrupt output, active high'] ||
                        mode === GPIOMode2100['Interrupt output, active low'];

                    this.eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            mode,
                            driveEnabled: !isInterrupt,
                            openDrainEnabled: isOutput,
                            pullEnabled: !isInterrupt && !isOutput,
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

        const dialogHandler = this.dialogHandler;
        if (dialogHandler && !this.offlineMode && this.index === 0) {
            const message = (
                <span>
                    GPIO{this.index} is used for interrupt by the nPM
                    Controller, changing this might have an effect of nPM
                    PowerUP behavior.
                </span>
            );

            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic2100-setGPIOMode-system-interrupt-${this.index}`,
                    message,
                    confirmLabel: 'OK',
                    optionalLabel: "OK, don't ask again",
                    cancelLabel: 'Cancel',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    }

    pull(pull: GPIOPullModeBase) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
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

        const dialogHandler = this.dialogHandler;
        if (dialogHandler && !this.offlineMode && this.index === 0) {
            const message = (
                <span>
                    GPIO{this.index} is used for interrupt by the nPM
                    Controller, changing this might have an effect of nPM
                    PowerUP behavior.
                </span>
            );

            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic2100-setGPIOPull-system-interrupt-${this.index}`,
                    message,
                    confirmLabel: 'OK',
                    optionalLabel: "OK, don't ask again",
                    cancelLabel: 'Cancel',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
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
