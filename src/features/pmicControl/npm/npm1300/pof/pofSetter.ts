/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { POF, POFPolarity, POFPolarityValues } from '../../types';
import { PofGet } from './pofGetters';

export class PofSet {
    private get: PofGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new PofGet(sendCommand);
    }

    enabled(enable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    enable,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof status set ${enable ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enable();
                        reject();
                    }
                );
            }
        });
    }

    threshold = (threshold: number) =>
        new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    threshold,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof threshold set ${threshold * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        this.get.threshold();
                        reject();
                    }
                );
            }
        });

    polarity = (polarity: POFPolarity) =>
        new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    polarity,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx pof polarity set ${POFPolarityValues.findIndex(
                        p => p === polarity
                    )}`,
                    () => resolve(),
                    () => {
                        this.get.polarity();
                        reject();
                    }
                );
            }
        });
}
