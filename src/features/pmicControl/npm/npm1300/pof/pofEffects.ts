/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { POF, POFPolarity, POFPolarityValues } from '../../types';

export const pofGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    pofEnable: () => sendCommand(`npmx pof status get`),
    pofPolarity: () => sendCommand(`npmx pof polarity get`),
    pofThreshold: () => sendCommand(`npmx pof threshold get`),
});

export const pofSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const { pofEnable, pofPolarity, pofThreshold } = pofGet(sendCommand);

    const setPOFEnabled = (enable: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    enable,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof status set ${enable ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        pofEnable();
                        reject();
                    }
                );
            }
        });

    const setPOFThreshold = (threshold: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    threshold,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof threshold set ${threshold * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        pofThreshold();
                        reject();
                    }
                );
            }
        });

    const setPOFPolarity = (polarity: POFPolarity) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<POF>('onPOFUpdate', {
                    polarity,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx pof polarity set ${POFPolarityValues.findIndex(
                        p => p === polarity
                    )}`,
                    () => resolve(),
                    () => {
                        pofPolarity();
                        reject();
                    }
                );
            }
        });

    return {
        setPOFEnabled,
        setPOFThreshold,
        setPOFPolarity,
    };
};
