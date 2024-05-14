/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { LongPressReset, ShipModeConfig, TimeToActive } from '../../types';

export const shipModeGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    shipModeTimeToActive: () => sendCommand(`npmx ship config time get`),
    shipLongPressReset: () => sendCommand(`powerup_ship longpress get`),
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
    const { shipModeTimeToActive, shipLongPressReset } =
        shipModeGet(sendCommand);

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

    const setShipLongPressReset = (longPressReset: LongPressReset) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<ShipModeConfig>('onShipUpdate', {
                    longPressReset,
                });
                resolve();
            } else {
                sendCommand(
                    `powerup_ship longpress set ${longPressReset}`,
                    () => resolve(),
                    () => {
                        shipLongPressReset();
                        reject();
                    }
                );
            }
        });

    return {
        setShipModeTimeToActive,
        setShipLongPressReset,
        enterShipMode: () => sendCommand(`npmx ship mode ship`),
        enterShipHibernateMode: () => sendCommand(`npmx ship mode hibernate`),
    };
};
