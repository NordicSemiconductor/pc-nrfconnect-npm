/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class BatteryGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.batteryInput();
        this.powerid();
    }

    batteryInput() {
        this.sendCommand(`batt_input_detect get`);
    }

    powerid() {
        this.sendCommand(`powerid`);
    }
}
