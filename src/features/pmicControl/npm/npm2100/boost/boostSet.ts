/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Boost,
    BoostMode,
    BoostModeControl,
    BoostPinMode,
    BoostPinSelection,
} from '../../types';
import { BoostGet } from './boostGet';

export class BoostSet {
    private get: BoostGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new BoostGet(sendCommand);
    }

    async all(config: Boost) {
        await this.vOut(config.vOutSoftware);
        await this.mode(config.mode);
        await this.modeControl(config.modeControl);
        await this.pinSelection(config.pinSelection);
        await this.pinMode(config.pinMode);
        await this.overCurrent(config.overCurrentProtection);
    }

    vOut(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        mode: 'Software',
                    },
                    0
                );
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        vOutSoftware: value,
                    },
                    0
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm2100 boost voutsel set Software`,
                    () => {
                        this.sendCommand(
                            `npm2100 boost vout SOFTWARE set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                this.get.vOutSoftware();
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
                        if (mode === 'Software') {
                            this.get.vOutSoftware();
                        } else {
                            this.get.vOutVSet();
                        }
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
