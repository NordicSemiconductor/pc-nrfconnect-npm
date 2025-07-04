/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { NpmEventEmitter } from '../../pmicHelpers';
import { FuelGauge, FuelGaugeExport, PmicDialog } from '../../types';
import { FuelGaugeGet } from './fuelGaugeGet';

export class FuelGaugeSet {
    private get: FuelGaugeGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
            unique?: boolean
        ) => void,
        private offlineMode: boolean,
        private initializeFuelGauge: () => Promise<void>,
        private dialogHandler?: ((dialog: PmicDialog) => void) | null
    ) {
        this.get = new FuelGaugeGet(sendCommand);
    }

    async all(fuelGauge: FuelGaugeExport) {
        const promises = [this.enabled(fuelGauge.enabled)];

        if (fuelGauge.discardPosiiveDeltaZ !== undefined) {
            promises.push(
                this.discardPosiiveDeltaZ(fuelGauge.discardPosiiveDeltaZ)
            );
        }

        await Promise.allSettled(promises);
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emit('onFuelGauge', {
                    enabled,
                } satisfies Partial<FuelGauge>);
                resolve();
            } else {
                this.sendCommand(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    () => {
                        resolve();
                        if (enabled) {
                            this.initializeFuelGauge();
                        }
                    },
                    () => {
                        this.get.enabled();
                        reject();
                    }
                );
            }
        });
    }

    activeBatteryModel(name: string) {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                this.sendCommand(
                    `fuel_gauge model set "${name}"`,
                    () => resolve(),
                    () => {
                        this.get.activeBatteryModel();
                        reject();
                    }
                );
            });

        const dialogHandler = this.dialogHandler;
        if (dialogHandler && !this.offlineMode) {
            const changeActiveBatteryDialog = (
                <span>Changing selected battery type. Are you sure?</span>
            );
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic2100-changeActiveBatteryType`,
                    message: changeActiveBatteryDialog,
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

    discardPosiiveDeltaZ(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emit('onFuelGauge', {
                    discardPosiiveDeltaZ: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `fuel_gauge params runtime discard_positive_deltaz set ${
                        enabled ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.discardPosiiveDeltaZ();
                        reject();
                    }
                );
            }
        });
    }
}
