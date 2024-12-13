/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { npm2100ResetConfig, ResetConfig } from '../../types';
import {
    npm2100LongPressResetDebounce,
    npm2100ResetPinSelection,
} from '../types';
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

    async all(shipMode: npm2100ResetConfig) {
        await this.longPressResetEnable(shipMode.longPressResetEnable);
    }

    longPressResetEnable(longPressResetEnable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetEnable,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl long_press_reset set ${
                        longPressResetEnable ? 'ENABLE' : 'DISABLE'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.longPressReset();
                        reject();
                    }
                );
            }
        });
    }

    selectResetPin(resetPinSelection: npm2100ResetPinSelection) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        resetPinSelection,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl pin_selection set ${resetPinSelection}`,
                    () => resolve(),
                    () => {
                        this.get.pinSelection();
                        reject();
                    }
                );
            }
        });
    }

    longPressResetDebounce(
        longPressResetDebounce: npm2100LongPressResetDebounce
    ) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<ResetConfig>(
                    'onResetUpdate',
                    {
                        longPressResetDebounce,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl long_press_reset_debounce set ${longPressResetDebounce}`,
                    () => resolve(),
                    () => {
                        this.get.longPressResetDebounce();
                        reject();
                    }
                );
            }
        });
    }
}
