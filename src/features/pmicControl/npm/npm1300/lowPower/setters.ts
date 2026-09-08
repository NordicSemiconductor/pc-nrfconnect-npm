/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type LowPowerConfig, type TimeToActive } from '../../types';
import { LowPowerGet } from './getters';

export class LowPowerSet {
    private get: LowPowerGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new LowPowerGet(sendCommand);
    }

    async all(shipMode: LowPowerConfig) {
        await Promise.allSettled([this.timeToActive(shipMode.timeToActive)]);
    }

    timeToActive(timeToActive: TimeToActive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        timeToActive,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ship config time set ${timeToActive}`,
                    () => resolve(),
                    () => {
                        this.get.timeToActive();
                        reject();
                    },
                );
            }
        });
    }
}
