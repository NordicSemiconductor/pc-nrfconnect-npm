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
        private index: number,
    ) {}

    all() {
        this.activeDischarge();
        this.enabled();
        this.mode();
        this.overcurrentProtection();
        this.onOffControl();
        this.softStart();
        this.softStartCurrent();
        this.softStartTime();
        this.vOutSel();
        this.voltage();
        this.weakPullDown();
    }

    activeDischarge() {
        this.sendCommand(`npm1012 ldosw activedischarge get ${this.index}`);
    }
    enabled() {
        this.sendCommand(`npm1012 ldosw enable get ${this.index}`);
    }
    mode() {
        this.sendCommand(`npm1012 ldosw mode get ${this.index}`);
    }
    overcurrentProtection() {
        this.sendCommand(`npm1012 ldosw ocp get ${this.index}`);
    }
    onOffControl() {
        this.sendCommand(`npm1012 ldosw enablectrl get ${this.index}`);
    }
    softStart() {
        this.sendCommand(`npm1012 ldosw softstart get ${this.index}`);
    }
    softStartCurrent() {
        this.sendCommand(`npm1012 ldosw softstartilim get ${this.index}`);
    }
    softStartTime() {
        this.sendCommand(`npm1012 ldosw softstarttime get ${this.index}`);
    }
    vOutSel() {
        this.sendCommand(`npm1012 ldosw voutsel get ${this.index}`);
    }
    voltage() {
        this.sendCommand(`npm1012 ldosw vout software get ${this.index}`);
    }
    weakPullDown() {
        this.sendCommand(`npm1012 ldosw weakpull get ${this.index}`);
    }
}
