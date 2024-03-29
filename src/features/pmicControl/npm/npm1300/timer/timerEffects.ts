/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    TimerConfig,
    TimerMode,
    TimerModeValues,
    TimerPrescaler,
    TimerPrescalerValues,
} from '../../types';

export const timerGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    timerConfigMode: () => sendCommand(`npmx timer config mode get`),
    timerConfigPrescaler: () => sendCommand(`npmx timer config prescaler get`),
    timerConfigCompare: () => sendCommand(`npmx timer config compare get`),
});

export const timerSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const { timerConfigMode, timerConfigPrescaler, timerConfigCompare } =
        timerGet(sendCommand);

    const setTimerConfigMode = (mode: TimerMode) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        mode,
                    }
                );
                resolve();
            } else {
                sendCommand(
                    `npmx timer config mode set ${TimerModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        timerConfigMode();
                        reject();
                    }
                );
            }
        });

    const setTimerConfigPrescaler = (prescaler: TimerPrescaler) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        prescaler,
                    }
                );
                resolve();
            } else {
                sendCommand(
                    `npmx timer config prescaler set ${TimerPrescalerValues.findIndex(
                        p => p === prescaler
                    )}`,
                    () => resolve(),
                    () => {
                        timerConfigPrescaler();
                        reject();
                    }
                );
            }
        });

    const setTimerConfigCompare = (period: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<TimerConfig>(
                    'onTimerConfigUpdate',
                    {
                        period,
                    }
                );
                resolve();
            } else {
                sendCommand(
                    `npmx timer config compare set ${period}`,
                    () => resolve(),
                    () => {
                        timerConfigCompare();
                        reject();
                    }
                );
            }
        });

    return {
        setTimerConfigMode,
        setTimerConfigPrescaler,
        setTimerConfigCompare,
    };
};
