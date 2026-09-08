/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type LongPressResetPinSel, type ResetConfig } from '../../types';
import { ResetGet } from './getters';

export class ResetSet {
    private get: ResetGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new ResetGet(sendCommand);
    }

    async all(shipMode: ResetConfig) {
        await Promise.allSettled([
            this.longPressResetPinSel(shipMode.longPressResetPinSel),
        ]);
    }

    longPressResetPinSel(longPressResetPinSel: LongPressResetPinSel) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetPinSel,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `powerup_ship longpress set ${longPressResetPinSel}`,
                    () => resolve(),
                    () => {
                        this.get.longPressResetPinSel();
                        reject();
                    },
                );
            }
        });
    }
}
