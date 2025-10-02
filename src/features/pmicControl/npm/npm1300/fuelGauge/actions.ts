/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter, parseColonBasedAnswer } from '../../pmicHelpers';
import { ProfileDownload } from '../../types';
import type FuelGaugeModule from '.';
import { FuelGaugeGet } from './getters';

export class FuelGaugeActions {
    private get: FuelGaugeGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
            unique?: boolean,
        ) => void,
        private fuelGaugeModule: FuelGaugeModule,
    ) {
        this.get = new FuelGaugeGet(sendCommand);
    }

    abortDownloadFuelGaugeProfile() {
        return new Promise<void>((resolve, reject) => {
            const profileDownload: ProfileDownload = {
                state: 'aborting',
            };
            this.eventEmitter.emit('onProfileDownloadUpdate', profileDownload);

            this.fuelGaugeModule.profileDownloadAborting = true;
            this.sendCommand(
                `fuel_gauge model download abort`,
                () => {
                    resolve();
                },
                () => {
                    reject();
                },
            );
        });
    }

    applyDownloadFuelGaugeProfile(slot = 0) {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                `fuel_gauge model download apply ${slot}`,
                () => {
                    resolve();
                },
                () => reject(),
            );
        });
    }

    downloadFuelGaugeProfile(profile: Buffer, slot?: number) {
        const chunkSize = 256;
        const chunks = Math.ceil(profile.byteLength / chunkSize);

        return new Promise<void>((resolve, reject) => {
            const downloadData = (chunk = 0) => {
                this.sendCommand(
                    `fuel_gauge model download "${profile
                        .subarray(chunk * chunkSize, (chunk + 1) * chunkSize)
                        .toString()
                        .replaceAll('"', '\\"')}"`,
                    () => {
                        const profileDownload: ProfileDownload = {
                            state: 'downloading',
                            completeChunks: chunk + 1,
                            totalChunks: Math.ceil(
                                profile.byteLength / chunkSize,
                            ),
                            slot,
                        };
                        this.eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload,
                        );

                        if (
                            this.fuelGaugeModule.profileDownloadInProgress &&
                            !this.fuelGaugeModule.profileDownloadAborting &&
                            chunk + 1 !== chunks
                        ) {
                            downloadData(chunk + 1);
                        } else {
                            resolve();
                            this.get.storedBatteryModel();
                            this.get.activeBatteryModel();
                        }
                    },
                    res => {
                        () => {
                            if (
                                this.fuelGaugeModule.profileDownloadInProgress
                            ) {
                                this.fuelGaugeModule.profileDownloadInProgress = false;
                                this.fuelGaugeModule.profileDownloadAborting = false;
                                const profileDownload: ProfileDownload = {
                                    state: 'failed',
                                    alertMessage: parseColonBasedAnswer('res'),
                                    slot,
                                };
                                this.eventEmitter.emit(
                                    'onProfileDownloadUpdate',
                                    profileDownload,
                                );
                            }
                            reject(res);
                        };
                    },
                    false,
                );
            };

            this.fuelGaugeModule.profileDownloadInProgress = true;
            this.fuelGaugeModule.profileDownloadAborting = false;
            this.sendCommand(
                'fuel_gauge model download begin',
                () => downloadData(),
                () => reject(),
            );
        });
    }

    reset() {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                `fuel_gauge reset`,
                () => {
                    resolve();
                },
                () => reject(),
            );
        });
    }
}
