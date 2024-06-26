/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { NpmEventEmitter } from '../../pmicHelpers';
import { PmicDialog } from '../../types';

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
    dialogHandler: ((dialog: PmicDialog) => void) | null,
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

    const setActiveBatteryModel = (name: string) => {
        const action = () =>
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

        if (dialogHandler && !offlineMode) {
            const changeActiveBatteryDialog = (
                <span>Changing selected battery type. Are you sure?</span>
            );
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic2100-changeActiveBatteryType`,
                    message: changeActiveBatteryDialog,
                    confirmLabel: 'OK',
                    optionalLabel: "OK, don't ask again",
                    cancelLabel: 'Cancel',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

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
