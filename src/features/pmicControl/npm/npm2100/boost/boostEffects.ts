/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line max-classes-per-file
import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Boost,
    BoostMode,
    BoostModeControl,
    BoostPinMode,
    BoostPinSelection,
    PmicDialog,
} from '../../types';

export class BoostGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private index: number
    ) {}

    all() {
        this.vOut();
        this.mode();
        this.modeControl();
        this.pinSelection();
        this.pinMode();
        this.overCurrent();
    }

    vOut() {
        this.sendCommand(`npm2100 boost vout get`);
    }

    mode() {
        this.sendCommand(`npm2100 boost mode get`);
    }

    modeControl() {
        this.sendCommand(`npm2100 boost voutsel get`);
    }

    pinSelection() {
        this.sendCommand(`npm2100 boost pinsel get`);
    }

    pinMode() {
        this.sendCommand(`npm2100 boost pinmode get`);
    }

    overCurrent() {
        this.sendCommand(`npm2100 boost ocp get`);
    }
}

export class BoostSet {
    private get: BoostGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private dialogHandler: ((dialog: PmicDialog) => void) | null,
        private offlineMode: boolean,
        private index: number
    ) {
        this.get = new BoostGet(sendCommand, this.index);
    }

    vOut(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        mode: 'SOFTWARE',
                    },
                    0
                );
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        vOut: value,
                    },
                    0
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost voutsel set SOFTWARE`,
                    () => {
                        this.sendCommand(
                            `npm2100 boost vout set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                this.get.vOut();
                                reject();
                            }
                        );
                    },
                    () => {
                        this.get.mode();
                        reject();
                    }
                );
            }
        });
    }

    mode(mode: BoostMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        mode,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost voutsel set ${mode}`,
                    () => {
                        this.get.vOut();
                        resolve();
                    },
                    () => {
                        this.get.mode();
                        reject();
                    }
                );
            }
        });
    }

    modeControl(modeControl: BoostModeControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        modeControl,
                    },
                    0
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost mode set ${modeControl}`,
                    () => resolve(),
                    () => {
                        this.get.modeControl();
                        reject();
                    }
                );
            }
        });
    }

    pinSelection(pinSelection: BoostPinSelection) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        pinSelection,
                        pinModeEnabled: pinSelection !== 'OFF',
                    },
                    0
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost pinsel set ${pinSelection}`,
                    () => resolve(),
                    () => {
                        this.get.pinSelection();
                        reject();
                    }
                );
            }
        });
    }

    pinMode(pinMode: BoostPinMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        pinMode,
                    },
                    0
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost pinmode set ${pinMode}`,
                    () => resolve(),
                    () => {
                        this.get.pinMode();
                        reject();
                    }
                );
            }
        });
    }

    overCurrent(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        overCurrentProtection: enabled,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost ocp set ${enabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.overCurrent();
                        reject();
                    }
                );
            }
        });
    }
}
