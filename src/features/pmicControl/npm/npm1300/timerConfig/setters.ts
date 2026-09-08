/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import {
    type TimerConfig,
    type TimerMode,
    type TimerPrescaler,
    TimerPrescalerValues,
} from '../../types';
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

        if (config.prescaler !== undefined) {
            promises.push(this.prescaler(config.prescaler));
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
                    `npmx timer config mode set ${mode}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    },
                );
            }
        });
    }

    prescaler(prescaler: TimerPrescaler) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        prescaler,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx timer config prescaler set ${TimerPrescalerValues.findIndex(
                        p => p === prescaler,
                    )}`,
                    () => resolve(),
                    () => {
                        this.get.prescaler();
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
                    `npmx timer config compare set ${period}`,
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
