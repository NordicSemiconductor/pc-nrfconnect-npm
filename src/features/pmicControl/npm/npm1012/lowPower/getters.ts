/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class LowPowerGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.hibernateWakeupByButton();
        this.timeToActive();
        this.vbusHibernateWait();
        this.vbusStandbyWait();
        this.vbusStatus();
    }

    hibernateWakeupByButton() {
        this.sendCommand(`npm1012 low_power_ctrl shphld hibernate_wakeup get`);
    }

    timeToActive() {
        this.sendCommand(`npm1012 low_power_ctrl shphld debounce get`);
    }

    vbusHibernateWait() {
        this.sendCommand(`npm1012 low_power_ctrl vbus hibernate_wait get`);
    }

    vbusStandbyWait() {
        this.sendCommand(`npm1012 low_power_ctrl vbus standby_wait get`);
    }

    vbusStatus() {
        this.sendCommand(`npm1012 low_power_ctrl vbus status get`);
    }
}
