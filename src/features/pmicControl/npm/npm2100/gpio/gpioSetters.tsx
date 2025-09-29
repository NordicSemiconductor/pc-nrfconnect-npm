/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIO,
    GPIODrive,
    GPIOExport,
    GPIOMode,
    GPIOPull,
    GPIOState,
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
        await Promise.allSettled([
            this.mode(gpio.mode as GPIOMode2100),
            this.pull(gpio.pull),
            this.drive(gpio.drive),
            this.openDrain(gpio.openDrain),
            this.debounce(gpio.debounce),
            this.state(gpio.state as GPIOState),
        ]);
    }

    mode(mode: GPIOMode) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    const isInput = mode === GPIOMode2100.Input;
                    const isOutput = mode === GPIOMode2100.Output;

                    this.eventEmitter.emitPartialEvent<GPIO>(
                        'onGPIOUpdate',
                        {
                            mode,
                            driveEnabled: !isInput,
                            openDrainEnabled: !isInput,
                            pullEnabled: true,
                            stateShown: isOutput,
                        },
                        this.index
                    );
                    resolve();
                } else {
                    this.sendCommand(
                        `npm2100 gpio mode set ${this.index} ${mode}`,
                        () => {
                            if (mode === GPIOMode2100.Output) this.get.state();
                            resolve();
                        },
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

    state(state: GPIOState) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<GPIO>(
                    'onGPIOUpdate',
                    {
                        state,
                    },
                    this.index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 gpio state set ${this.index} ${state}`,
                    () => resolve(),
                    () => {
                        this.get.state();
                        reject();
                    }
                );
            }
        });
    }

    pull(pull: GPIOPull) {
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
