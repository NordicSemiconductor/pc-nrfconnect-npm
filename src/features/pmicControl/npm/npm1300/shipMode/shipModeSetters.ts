/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { LongPressReset, ShipModeConfig, TimeToActive } from '../../types';
import { ShipModeGet } from './shipModeGetters';

export class ShipModeSet {
    private get: ShipModeGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new ShipModeGet(sendCommand);
    }

    async all(shipMode: ShipModeConfig) {
        await this.timeToActive(shipMode.timeToActive);
        await this.longPressReset(shipMode.longPressReset);
    }

    timeToActive(timeToActive: TimeToActive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ShipModeConfig>(
                    'onShipUpdate',
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

    longPressReset(longPressReset: LongPressReset) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ShipModeConfig>(
                    'onShipUpdate',
                    {
                        longPressReset,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `powerup_ship longpress set ${longPressReset}`,
                    () => resolve(),
                    () => {
                        this.get.longPressReset();
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
