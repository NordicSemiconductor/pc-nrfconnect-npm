/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { USBPower, USBPowerExport } from '../../types';
import { UsbCurrentLimiterGet } from './getters';

export class UsbCurrentLimiterSet {
    private get: UsbCurrentLimiterGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new UsbCurrentLimiterGet(sendCommand);
    }

    async all(usb: USBPowerExport) {
        await this.vBusInCurrentLimiter(usb.currentLimiter);
    }

    vBusInCurrentLimiter(amps: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<USBPower>('onUsbPower', {
                    currentLimiter: amps,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx vbusin current_limit set ${amps * 1000}`,
                    () => resolve(),
                    () => {
                        this.get.vBusInCurrentLimiter();
                        reject();
                    }
                );
            }
        });
    }
}
