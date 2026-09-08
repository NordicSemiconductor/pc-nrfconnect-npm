/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type POF, type POFPolarity, POFPolarityValues } from '../../types';
import { PofGet } from './getters';

export class PofSet {
    private get: PofGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new PofGet(sendCommand);
    }

    async all(pof: POF) {
        const promises = [this.resetThreshold(pof.resetThreshold)];

        if (pof.enabled !== undefined) {
            promises.push(this.enabled(pof.enabled));
        }
        if (pof.polarity !== undefined) {
            promises.push(this.polarity(pof.polarity));
        }

        await Promise.allSettled(promises);
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof status set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    resetThreshold(resetThreshold: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    resetThreshold,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof threshold set ${resetThreshold * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        this.get.resetThreshold();
                        reject();
                    },
                );
            }
        });
    }

    polarity(polarity: POFPolarity) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    polarity,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof polarity set ${POFPolarityValues.findIndex(
                        p => p === polarity,
                    )}`,
                    () => resolve(),
                    () => {
                        this.get.polarity();
                        reject();
                    },
                );
            }
        });
    }
}
