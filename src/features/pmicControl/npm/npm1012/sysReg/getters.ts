/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class SysRegGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.vBusDpm();
        this.vBusILim();
        this.vBusStatus();
    }

    vBusDpm() {
        this.sendCommand('npm1012 sysreg vbusdpm get');
    }

    vBusILim() {
        this.sendCommand('npm1012 sysreg vbusilim get');
    }

    vBusStatus() {
        this.sendCommand('npm1012 sysreg vbus_status get');
    }
}
