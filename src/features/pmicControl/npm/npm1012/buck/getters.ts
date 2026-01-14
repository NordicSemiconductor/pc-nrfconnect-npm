/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class BuckGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private index: number,
    ) {}

    all() {
        this.vOutNormal();
        this.vOutRetention();
        this.mode();
        this.enabled();
        this.modeControl();
        this.onOffControl();
        this.retentionControl();
        this.activeDischarge();
    }

    vOutNormal() {
        this.sendCommand(`npmx buck voltage normal get ${this.index}`);
    }

    vOutRetention() {
        this.sendCommand(`npmx buck voltage retention get ${this.index}`);
    }

    mode() {
        this.sendCommand(`npmx buck vout_select get ${this.index}`);
    }

    modeControl() {
        this.sendCommand(`powerup_buck mode get ${this.index}`);
    }

    onOffControl() {
        this.sendCommand(`npmx buck gpio on_off index get ${this.index}`);
    }

    retentionControl() {
        this.sendCommand(`npmx buck gpio retention index get ${this.index}`);
    }

    enabled() {
        this.sendCommand(`npmx buck status get ${this.index}`);
    }

    activeDischarge() {
        this.sendCommand(`npmx buck active_discharge get ${this.index}`);
    }
}
