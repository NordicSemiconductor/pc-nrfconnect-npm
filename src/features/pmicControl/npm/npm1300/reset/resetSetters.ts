/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { LongPressReset, ResetConfig } from '../../types';
import { ResetGet } from './resetGetters';

export class ResetSet {
    private get: ResetGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new ResetGet(sendCommand);
    }

    async all(shipMode: ResetConfig) {
        await this.longPressReset(shipMode.longPressReset);
    }

    longPressReset(longPressReset: LongPressReset) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onLowPowerUpdate',
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
}
