/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type TimerConfig, type TimerMode } from '../../types';
import { TimerConfigGet } from './timerConfigGetter';

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

    mode(mode: TimerMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        mode,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 timer mode set ${mode}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    },
                );
            }
        });
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        enabled,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 timer state set ${enabled ? 'ENABLE' : 'DISABLE'}`,
                    () => resolve(),
                    () => {
                        this.get.state();
                        reject();
                    },
                );
            }
        });
    }

    period(period: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        period,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 timer period set ${period / 1000}`,
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
