/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type POF } from '../../types';
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

    async all(config: POF) {
        const promises = [this.resetThreshold(config.resetThreshold)];

        if (config.warnThreshold) {
            promises.push(this.warnThreshold(config.warnThreshold));
        }

        await Promise.allSettled(promises);
    }

    resetThreshold(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    resetThreshold: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 reset_ctrl pof reset_threshold set ${value}V`,
                    () => resolve(),
                    () => {
                        this.get.resetThreshold();
                        reject();
                    },
                );
            }
        });
    }

    warnThreshold(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    warnThreshold: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 reset_ctrl pof warn_threshold set ${value}V`,
                    () => resolve(),
                    () => {
                        this.get.warnThreshold();
                        reject();
                    },
                );
            }
        });
    }
}
