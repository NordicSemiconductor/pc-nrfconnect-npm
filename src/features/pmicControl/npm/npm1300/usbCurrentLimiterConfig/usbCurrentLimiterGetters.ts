/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class UsbCurrentLimiterGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.vBusInCurrentLimiter();
        this.usbPowered();
    }

    vBusInCurrentLimiter() {
        this.sendCommand(`npmx vbusin current_limit get`);
    }

    usbPowered() {
        this.sendCommand(`npmx vbusin status cc get`);
    }
}
