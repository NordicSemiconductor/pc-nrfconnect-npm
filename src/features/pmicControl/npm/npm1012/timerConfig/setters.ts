/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type TimerConfig, type TimerMode } from '../../types';
import { TimerConfigGet } from './getters';

export class TimerConfigSet {
    private get: TimerConfigGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new TimerConfigGet(sendCommand);
    }

    async all(config: TimerConfig) {
        const promises = [this.mode(config.mode), this.period(config.period)];

        if (config.enabled !== undefined) {
            promises.push(this.enabled(config.enabled));
        }

        await Promise.allSettled(promises);
    }

    enabled(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        enabled: value,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 timer state set ${value ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    mode(value: TimerMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        mode: value,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 timer mode set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    },
                );
            }
        });
    }

    period(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        period: value,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 timer period set ${value / 1000}`,
                    () => resolve(),
                    () => {
                        this.get.period();
                        reject();
                    },
                );
            }
        });
    }
}
