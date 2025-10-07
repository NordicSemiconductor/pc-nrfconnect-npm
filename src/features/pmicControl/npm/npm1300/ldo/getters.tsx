/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
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
        this.voltage();
        this.mode();
        this.enabled();
        this.softStartEnabled();
        this.softStart();
        this.activeDischarge();
        this.onOffControl();
    }

    voltage() {
        this.sendCommand(`npmx ldsw ldo_voltage get ${this.index}`);
    }
    enabled() {
        this.sendCommand(`npmx ldsw status get ${this.index}`);
    }
    mode() {
        this.sendCommand(`npmx ldsw mode get ${this.index}`);
    }
    softStartEnabled() {
        this.sendCommand(`npmx ldsw soft_start enable get ${this.index}`);
    }
    softStart() {
        this.sendCommand(`npmx ldsw soft_start current get ${this.index}`);
    }
    activeDischarge() {
        this.sendCommand(`npmx ldsw active_discharge get ${this.index}`);
    }
    onOffControl() {
        this.sendCommand(`npmx ldsw gpio index get ${this.index}`);
    }
}
