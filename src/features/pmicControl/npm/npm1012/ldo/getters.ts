/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class LdoGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.activeDischarge();
        this.enabled();
        this.mode();
        this.ocp();
        this.onOffControl();
        this.softStartCurrentLimit();
        this.softStartTime();
        this.vOutSel();
        this.voltage();
        this.weakPullDown();
    }

    activeDischarge() {
        this.sendCommand('npm1012 ldosw activedischarge get 0');
    }
    enabled() {
        this.sendCommand('npm1012 ldosw enable get 0');
    }
    mode() {
        this.sendCommand('npm1012 ldosw mode get 0');
    }
    ocp() {
        this.sendCommand('npm1012 ldosw ocp get 0');
    }
    onOffControl() {
        this.sendCommand('npm1012 ldosw enablectrl get 0');
    }
    softStartCurrentLimit() {
        this.sendCommand('npm1012 ldosw softstartilim get 0');
    }
    softStartTime() {
        this.sendCommand('npm1012 ldosw softstarttime get 0');
    }
    vOutSel() {
        this.sendCommand('npm1012 ldosw voutsel get 0');
    }
    voltage() {
        this.sendCommand('npm1012 ldosw vout software get 0');
    }
    weakPullDown() {
        this.sendCommand('npm1012 ldosw weakpull get 0');
    }
}
