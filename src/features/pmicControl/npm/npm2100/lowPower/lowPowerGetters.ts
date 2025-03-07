/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class LowPowerGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.powerButtonEnable();
        this.timeToActive();
    }

    powerButtonEnable() {
        this.sendCommand(`npm2100 low_power_control pwr_btn get`);
    }
    timeToActive() {
        this.sendCommand(`npm2100 low_power_control hibernate_debounce get`);
    }
}
