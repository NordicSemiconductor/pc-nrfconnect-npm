/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import {
    type npm2100LowPowerConfig,
    type npm2100TimeToActive,
} from '../../types';
import { LowPowerGet } from './lowPowerGetters';

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

    async all(lowPower: npm2100LowPowerConfig) {
        await Promise.allSettled([
            this.timeToActive(lowPower.timeToActive),
            this.powerButtonEnable(lowPower.powerButtonEnable),
        ]);
    }

    powerButtonEnable(powerButtonEnable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<npm2100LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        powerButtonEnable,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 low_power_control pwr_btn set ${
                        powerButtonEnable ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.powerButtonEnable();
                        reject();
                    },
                );
            }
        });
    }

    timeToActive(timeToActive: npm2100TimeToActive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<npm2100LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        timeToActive,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 low_power_control hibernate_debounce set ${timeToActive}`,
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
