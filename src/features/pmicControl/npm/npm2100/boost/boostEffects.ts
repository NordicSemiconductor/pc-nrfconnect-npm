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
        ) => void
    ) {}

    all(index: number) {
        this.vOut(index);
        this.mode(index);
        this.modeControl(index);
        this.pinSelection(index);
        this.pinMode(index);
        this.overCurrent(index);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    vOut(_: number) {
        this.sendCommand(`npm2100 boost vout get`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mode(_: number) {
        this.sendCommand(`npm2100 boost mode get`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    modeControl(_: number) {
        this.sendCommand(`npm2100 boost voutsel get`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pinSelection(_: number) {
        this.sendCommand(`npm2100 boost pinsel get`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    pinMode(_: number) {
        this.sendCommand(`npm2100 boost pinmode get`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    overCurrent(_: number) {
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
        private offlineMode: boolean
    ) {
        this.get = new BoostGet(sendCommand);
    }

    vOut(_: number, value: number) {
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
                                this.get.vOut(0);
                                reject();
                            }
                        );
                    },
                    () => {
                        this.get.mode(0);
                        reject();
                    }
                );
            }
        });
    }

    mode(_: number, mode: BoostMode) {
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
                        this.get.vOut(0);
                        resolve();
                    },
                    () => {
                        this.get.mode(0);
                        reject();
                    }
                );
            }
        });
    }

    modeControl(_: number, modeControl: BoostModeControl) {
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
                        this.get.modeControl(0);
                        reject();
                    }
                );
            }
        });
    }

    pinSelection(_: number, pinSelection: BoostPinSelection) {
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
                        this.get.pinSelection(0);
                        reject();
                    }
                );
            }
        });
    }

    pinMode(_: number, pinMode: BoostPinMode) {
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
                        this.get.pinMode(0);
                        reject();
                    }
                );
            }
        });
    }

    overCurrent(_: number, enabled: boolean) {
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
                        this.get.overCurrent(0);
                        reject();
                    }
                );
            }
        });
    }
}
