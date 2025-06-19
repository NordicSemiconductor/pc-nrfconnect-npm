/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { FuelGauge, FuelGaugeExport } from '../../types';
import { FuelGaugeGet } from './getters';

export class FuelGaugeSet {
    private get: FuelGaugeGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new FuelGaugeGet(sendCommand);
    }

    async all(fuelGauge: FuelGaugeExport) {
        await Promise.allSettled([this.enabled(fuelGauge.enabled)]);
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
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    }
                );
            }
        });
    }

    activeBatteryModel(name: string) {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                `fuel_gauge model set "${name}"`,
                () => resolve(),
                () => {
                    this.get.activeBatteryModel();
                    reject();
                }
            );
        });
    }

    batteryStatusCheckEnabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                `npm_chg_status_check set ${enabled ? '1' : '0'}`,
                () => resolve(),
                () => reject()
            );
        });
    }
}
