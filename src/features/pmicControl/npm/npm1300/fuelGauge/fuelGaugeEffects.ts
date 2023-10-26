/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';

export const fuelGaugeGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    fuelGauge: () => sendCommand('fuel_gauge get'),
    activeBatteryModel: () => sendCommand(`fuel_gauge model get`),
    storedBatteryModel: () => sendCommand(`fuel_gauge model list`),
});

export const fuelGaugeSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const { fuelGauge, activeBatteryModel } = fuelGaugeGet(sendCommand);

    const setFuelGaugeEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emit('onFuelGauge', enabled);
                resolve();
            } else {
                sendCommand(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        fuelGauge();
                        reject();
                    }
                );
            }
        });

    const setActiveBatteryModel = (name: string) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model set "${name}"`,
                () => resolve(),
                () => {
                    activeBatteryModel();
                    reject();
                }
            );
        });

    const setBatteryStatusCheckEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `npm_chg_status_check set ${enabled ? '1' : '0'}`,
                () => resolve(),
                () => reject()
            );
        });

    return {
        setFuelGaugeEnabled,
        setActiveBatteryModel,
        setBatteryStatusCheckEnabled,
    };
};
