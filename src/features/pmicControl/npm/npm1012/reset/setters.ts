/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import {
    type LongPressResetDebounce,
    type LongPressResetPinSel,
    type PowerDownWait,
    type ResetConfig,
} from '../../types';
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
        if (config.powerDownWait !== undefined) {
            promises.push(this.powerDownWait(config.powerDownWait));
        }

        await Promise.allSettled(promises);
    }

    longPressResetDebounce(value: LongPressResetDebounce) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetDebounce: value,
                    },
                );
                resolve();
                return;
            }

            this.sendCommand(
                `npm1012 reset_ctrl long_press_reset debounce set ${value}`,
                () => resolve(),
                () => {
                    this.get.longPressResetDebounce();
                    reject();
                },
            );
        });
    }

    longPressResetEnable(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetEnable: value,
                    },
                );
                resolve();
                return;
            }

            this.sendCommand(
                `npm1012 reset_ctrl long_press_reset enable set ${value ? 'on' : 'off'}`,
                () => resolve(),
                () => {
                    this.get.longPressResetEnable();
                    reject();
                },
            );
        });
    }

    longPressResetPinSel(value: LongPressResetPinSel) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetPinSel: value,
                    },
                );
                resolve();
                return;
            }

            this.sendCommand(
                `npm1012 reset_ctrl long_press_reset pinsel set ${value}`,
                () => resolve(),
                () => {
                    this.get.longPressResetPinSel();
                    reject();
                },
            );
        });
    }

    powerDownWait(value: PowerDownWait) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        powerDownWait: value,
                    },
                );
                resolve();
                return;
            }

            this.sendCommand(
                `npm1012 reset_ctrl powerdown_wait set ${value}`,
                () => resolve(),
                () => {
                    this.get.powerDownWait();
                    reject();
                },
            );
        });
    }
}
