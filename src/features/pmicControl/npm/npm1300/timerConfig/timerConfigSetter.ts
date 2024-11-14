/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    npm1300TimerConfig,
    TimerConfig,
    TimerMode,
    TimerPrescaler,
    TimerPrescalerValues,
} from '../../types';
import { TimerConfigGet } from './timerConfigGetter';

export class TimerConfigSet {
    private get: TimerConfigGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new TimerConfigGet(sendCommand);
    }

    async all(timerConfig: npm1300TimerConfig) {
        await this.mode(timerConfig.mode);
        await this.prescaler(timerConfig.prescaler);
        await this.period(timerConfig.period);
    }

    mode(mode: TimerMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        mode,
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx timer config mode set ${mode}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    }
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
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx timer config prescaler set ${TimerPrescalerValues.findIndex(
                        p => p === prescaler
                    )}`,
                    () => resolve(),
                    () => {
                        this.get.prescaler();
                        reject();
                    }
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
                    }
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx timer config compare set ${period}`,
                    () => resolve(),
                    () => {
                        this.get.period();
                        reject();
                    }
                );
            }
        });
    }
}
