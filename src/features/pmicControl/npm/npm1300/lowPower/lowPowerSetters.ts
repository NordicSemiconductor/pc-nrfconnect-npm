/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { npm1300LowPowerConfig, npm1300TimeToActive } from '../../types';
import { LowPowerGet } from './lowPowerGetters';

export class LowPowerSet {
    private get: LowPowerGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new LowPowerGet(sendCommand);
    }

    async all(shipMode: npm1300LowPowerConfig) {
        await this.timeToActive(shipMode.timeToActive);
    }

    timeToActive(timeToActive: npm1300TimeToActive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<npm1300LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        timeToActive,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx ship config time set ${timeToActive}`,
                    () => resolve(),
                    () => {
                        this.get.timeToActive();
                        reject();
                    }
                );
            }
        });
    }

    enterShipMode() {
        this.sendCommand(`npmx ship mode ship`);
    }
    enterShipHibernateMode() {
        this.sendCommand(`npmx ship mode hibernate`);
    }
}
