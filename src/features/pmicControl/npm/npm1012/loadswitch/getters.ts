/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class LoadSwitchGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.activeDischarge();
        this.enable();
        this.onOffControl();
        this.softStartCurrentLimit();
        this.softStartTime();
    }

    activeDischarge() {
        this.sendCommand('npm1012 ldosw activedischarge get 1');
    }
    enable() {
        this.sendCommand('npm1012 ldosw enable get 1');
    }
    onOffControl() {
        this.sendCommand('npm1012 ldosw enablectrl get 1');
    }
    overCurrentProtection() {
        this.sendCommand('npm1012 ldosw ocp get 1');
    }
    softStartCurrentLimit() {
        this.sendCommand('npm1012 ldosw softstartilim get 1');
    }
    softStartTime() {
        this.sendCommand('npm1012 ldosw softstarttime get 1');
    }
}
