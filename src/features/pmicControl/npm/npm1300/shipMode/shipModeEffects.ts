/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { ShipModeConfig, TimeToActive } from '../../types';

export const shipModeGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    shipModeTimeToActive: () => sendCommand(`npmx ship config time get`),
    shipInvertPolarity: () => sendCommand(`npmx ship config inv_polarity get`),
    shipLongPressReset: () => sendCommand(`npmx ship reset long_press get`),
    shipTwoButtonReset: () => sendCommand(`npmx ship reset two_buttons get`),
});

export const shipModeSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const {
        shipModeTimeToActive,
        shipInvertPolarity,
        shipLongPressReset,
        shipTwoButtonReset,
    } = shipModeGet(sendCommand);

    const setShipModeTimeToActive = (timeToActive: TimeToActive) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    timeToActive,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship config time set ${timeToActive}`,
                    () => resolve(),
                    () => {
                        shipModeTimeToActive();
                        reject();
                    }
                );
            }
        });

    const setShipInvertPolarity = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    invPolarity: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship config inv_polarity set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        shipInvertPolarity();
                        reject();
                    }
                );
            }
        });

    const setShipLongPressReset = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    longPressReset: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship reset long_press set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        shipLongPressReset();
                        reject();
                    }
                );
            }
        });

    const setShipTwoButtonReset = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    twoButtonReset: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx ship reset two_buttons set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        shipTwoButtonReset();
                        reject();
                    }
                );
            }
        });

    return {
        setShipModeTimeToActive,
        setShipInvertPolarity,
        setShipLongPressReset,
        setShipTwoButtonReset,
        enterShipMode: () => sendCommand(`npmx ship mode ship`),
        enterShipHibernateMode: () => sendCommand(`npmx ship mode hibernate`),
    };
};
