/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { type NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIOValues,
    type Ldo,
    type LdoExport,
    type LdoMode,
    type LdoOnOffControl,
    LdoOnOffControlValues,
    type PmicDialog,
    type SoftStart,
} from '../../types';
import { LdoGet } from './getters';

export class LdoSet {
    private get: LdoGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private dialogHandler: ((dialog: PmicDialog) => void) | null,
        private offlineMode: boolean,
        private index: number,
    ) {
        this.get = new LdoGet(sendCommand, index);
    }

    async all(ldo: LdoExport) {
        await Promise.allSettled([
            this.voltage(ldo.voltage),
            this.enabled(ldo.enabled),
            this.softStartEnabled(ldo.softStartEnabled),
            this.softStart(ldo.softStart),
            this.activeDischarge(ldo.activeDischarge),
            this.onOffControl(ldo.onOffControl),
            this.mode(ldo.mode),
        ]);
    }

    mode(mode: LdoMode) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    this.eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode,
                        },
                        this.index,
                    );
                    resolve();
                } else {
                    this.sendCommand(
                        `npmx ldsw mode set ${this.index} ${
                            mode === 'Load_switch' ? '0' : '1'
                        }`,
                        () => resolve(),
                        () => {
                            this.get.mode();
                            reject();
                        },
                    );
                }
            });

        const dialogHandler = this.dialogHandler;
        if (dialogHandler && !this.offlineMode && mode === 'LDO') {
            const ldo1Message = (
                <span>
                    Before enabling LDO1, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO1
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT1</span>{' '}
                            - LS
                            <span className="subscript">IN1</span>.
                        </li>
                        <li>
                            Disconnect HIGH - LS
                            <span className="subscript">OUT1</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN1, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            const ldo2Message = (
                <span>
                    Before enabling LDO2, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO2
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT2</span>{' '}
                            - LS
                            <span className="subscript">IN2</span>.
                        </li>
                        <li>
                            Disconnect LOW - LS
                            <span className="subscript">OUT2</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN2, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic1300-setLdoMode-${this.index}`,
                    message: this.index === 0 ? ldo1Message : ldo2Message,
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

    voltage(voltage: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Ldo>(
                'onLdoUpdate',
                {
                    voltage,
                },
                this.index,
            );

            if (this.offlineMode) {
                resolve();
            } else {
                this.mode('LDO')
                    .then(() => {
                        this.sendCommand(
                            `npmx ldsw ldo_voltage set ${this.index} ${
                                voltage * 1000
                            }`,
                            () => resolve(),
                            () => {
                                this.get.voltage();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.voltage();
                        reject();
                    });
            }
        });
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        enabled,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ldsw status set ${this.index} ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    softStartEnabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartEnabled: enabled,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ldsw soft_start enable set ${this.index} ${
                        enabled ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.softStartEnabled();
                        reject();
                    },
                );
            }
        });
    }

    softStart(softStart: SoftStart) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStart,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ldsw soft_start current set ${this.index} ${softStart}`,
                    () => resolve(),
                    () => {
                        this.get.softStart();
                        reject();
                    },
                );
            }
        });
    }

    activeDischarge(activeDischarge: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        activeDischarge,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ldsw active_discharge set ${this.index} ${
                        activeDischarge ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.activeDischarge();
                        reject();
                    },
                );
            }
        });
    }

    onOffControl(onOffControl: LdoOnOffControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        onOffControl,
                        onOffSoftwareControlEnabled:
                            onOffControl === LdoOnOffControlValues[0],
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ldsw gpio index set ${
                        this.index
                    } ${GPIOValues.findIndex(v => v === onOffControl)}`,
                    () => resolve(),
                    () => {
                        this.get.onOffControl();
                        reject();
                    },
                );
            }
        });
    }
}
