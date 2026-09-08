/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import {
    type LongPressResetDebounce,
    type LongPressResetPinSel,
    type ResetConfig,
} from '../../types';
import { ResetGet } from './resetGetters';

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

    async all(config: ResetConfig) {
        const promises = [
            this.longPressResetPinSel(config.longPressResetPinSel),
        ];

        if (config.longPressResetDebounce !== undefined) {
            promises.push(
                this.longPressResetDebounce(config.longPressResetDebounce),
            );
        }
        if (config.longPressResetEnable !== undefined) {
            promises.push(
                this.longPressResetEnable(config.longPressResetEnable),
            );
        }

        await Promise.allSettled(promises);
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
                    `npm2100 reset_ctrl pin_selection set ${longPressResetPinSel}`,
                    () => resolve(),
                    () => {
                        this.get.longPressResetPinSel();
                        reject();
                    },
                );
            }
        });
    }

    longPressResetEnable(longPressResetEnable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetEnable,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl long_press_reset set ${
                        longPressResetEnable ? 'ENABLE' : 'DISABLE'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.longPressResetEnable();
                        reject();
                    },
                );
            }
        });
    }

    longPressResetDebounce(longPressResetDebounce: LongPressResetDebounce) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetDebounce,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl long_press_reset_debounce set ${longPressResetDebounce}`,
                    () => resolve(),
                    () => {
                        this.get.longPressResetDebounce();
                        reject();
                    },
                );
            }
        });
    }
}
