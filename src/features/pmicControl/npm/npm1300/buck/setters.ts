/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Buck,
    BuckExport,
    BuckMode,
    BuckModeControl,
    BuckOnOffControl,
    BuckOnOffControlValues,
    BuckRetentionControl,
    GPIOValues,
    PmicDialog,
} from '../../types';
import { BuckGet } from './getters';

export class BuckSet {
    private get: BuckGet;

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
        this.get = new BuckGet(sendCommand, index);
    }

    async all(config: BuckExport) {
        const promises = [
            this.vOutNormal(config.vOutNormal),
            this.enabled(config.enabled),
            this.modeControl(config.modeControl),
            this.onOffControl(config.onOffControl),
            this.mode(config.mode),
        ];
        if (config.activeDischarge !== undefined) {
            promises.push(this.activeDischarge(config.activeDischarge));
        }
        if (config.retentionControl !== undefined) {
            promises.push(this.retentionControl(config.retentionControl));
        }
        if (config.vOutRetention !== undefined) {
            promises.push(this.vOutRetention(config.vOutRetention));
        }

        await Promise.allSettled(promises);
    }

    vOutNormal(value: number) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    this.eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutNormal: value,
                        },
                        this.index,
                    );

                    this.eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            mode: 'software',
                        },
                        this.index,
                    );

                    resolve();
                } else {
                    this.sendCommand(
                        `npmx buck voltage normal set ${this.index} ${
                            value * 1000
                        }`,
                        () =>
                            this.sendCommand(
                                `npmx buck vout_select set ${this.index} 1`,
                                () => resolve(),
                                () => {
                                    this.get.mode();
                                    reject();
                                },
                            ),
                        () => {
                            this.get.vOutNormal();
                            reject();
                        },
                    );
                }
            });

        const dialogHandler = this.dialogHandler;
        if (
            dialogHandler &&
            !this.offlineMode &&
            this.index === 1 &&
            value <= 1.6
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-1',
                    message: `Buck 2 powers the I2C communication required by this app. A voltage lower than 1.6 V might cause issues with the app connection.
                        Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: () => {
                        this.get.vOutNormal();
                        reject();
                    },
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    }

    vOutRetention(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutRetention: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npmx buck voltage retention set ${this.index} ${
                        value * 1000
                    }`,
                    () => resolve(),
                    () => {
                        this.get.vOutRetention();
                        reject();
                    },
                );
            }
        });
    }

    mode(mode: BuckMode) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    this.eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            mode,
                        },
                        this.index,
                    );
                    resolve();
                } else {
                    this.sendCommand(
                        `npmx buck vout_select set ${this.index} ${
                            mode === 'software' ? 1 : 0
                        }`,
                        () => {
                            this.get.vOutNormal();
                            resolve();
                        },
                        () => {
                            this.get.mode();
                            reject();
                        },
                    );
                }
            });

        // TODO Check software voltage as well
        const dialogHandler = this.dialogHandler;
        if (
            dialogHandler &&
            !this.offlineMode &&
            this.index === 1 &&
            mode === 'software'
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                    message: `Buck 2 powers the I2C communication required by this app. A software voltage might be already set to less then 1.6 V . Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
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

    modeControl(modeControl: BuckModeControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        modeControl,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `powerup_buck mode set ${this.index} ${modeControl}`,
                    () => resolve(),
                    () => {
                        this.get.modeControl();
                        reject();
                    },
                );
            }
        });
    }

    onOffControl(onOffControl: BuckOnOffControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        onOffControl,
                        onOffSoftwareControlEnabled:
                            onOffControl === BuckOnOffControlValues[0],
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npmx buck gpio on_off index set ${
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

    retentionControl(retentionControl: BuckRetentionControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        retentionControl,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npmx buck gpio retention index set ${
                        this.index
                    } ${GPIOValues.findIndex(v => v === retentionControl)}`,
                    () => resolve(),
                    () => {
                        this.get.retentionControl();
                        reject();
                    },
                );
            }
        });
    }

    enabled(enabled: boolean) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (this.offlineMode) {
                    this.eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            enabled,
                        },
                        this.index,
                    );
                    resolve();
                } else {
                    this.sendCommand(
                        `npmx buck status set ${this.index} ${
                            enabled ? '1' : '0'
                        }`,
                        () => resolve(),
                        () => {
                            this.get.enabled();
                            reject();
                        },
                    );
                }
            });

        const dialogHandler = this.dialogHandler;
        if (
            dialogHandler &&
            !this.offlineMode &&
            this.index === 1 &&
            !enabled
        ) {
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: 'pmic1300-setBuckEnabled-1',
                    message: `Disabling the buck 2 might effect I2C communications to the PMIC chip and hance you might get
                    disconnected from the app. Are you sure you want to continue?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
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

    activeDischarge(activeDischargeEnabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        activeDischarge: activeDischargeEnabled,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npmx buck active_discharge set ${this.index} ${
                        activeDischargeEnabled ? '1' : '0'
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
}
