/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class FuelGaugeGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.enabled();
        this.activeBatteryModel();
        this.storedBatteryModel();
    }

    enabled() {
        this.sendCommand('fuel_gauge get');
    }

    activeBatteryModel() {
        this.sendCommand(`fuel_gauge model get`);
    }

    storedBatteryModel() {
        this.sendCommand(`fuel_gauge model list`);
    }
}
