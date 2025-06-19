/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter, parseColonBasedAnswer } from '../../pmicHelpers';
import {
    Boost,
    BoostExport,
    BoostModeControl,
    BoostPinMode,
    BoostPinSelection,
    BoostVOutSel,
    PmicDialog,
} from '../../types';
import { BoostGet } from './getters';

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

    async all(config: BoostExport) {
        await Promise.allSettled([
            this.vOut(config.vOutSoftware),
            this.vOutSel(config.vOutSelect),
            this.modeControl(config.modeControl),
            this.pinSelection(config.pinSelection),
            this.pinMode(config.pinMode),
            this.overCurrent(config.overCurrentProtection),
        ]);
    }

    vOut(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        vOutSelect: 'Software',
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
                            response => {
                                this.get.vOutSoftware();
                                this.dialogHandler?.({
                                    type: 'alert',
                                    doNotAskAgainStoreID: `pmic2100-setBoostVOut`,
                                    message: `${parseColonBasedAnswer(
                                        response
                                    )}.`,
                                    confirmLabel: 'OK',
                                    optionalLabel: "OK, don't ask again",
                                    title: 'Error',
                                    onConfirm: () => {},
                                });

                                reject();
                            }
                        );
                    },
                    () => {
                        this.get.vOutSel();
                        reject();
                    }
                );
            }
        });
    }

    vOutSel(mode: BoostVOutSel) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Boost>(
                    'onBoostUpdate',
                    {
                        vOutSelect: mode,
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
                        this.get.vOutSel();
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
