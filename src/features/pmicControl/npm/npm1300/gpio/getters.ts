/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class GpioGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private index: number,
    ) {}

    all() {
        this.mode();
        this.pull();
        this.drive();
        this.openDrain();
        this.debounce();
    }

    mode() {
        this.sendCommand(`npmx gpio config mode get ${this.index}`);
    }
    pull() {
        this.sendCommand(`npmx gpio config pull get ${this.index}`);
    }
    drive() {
        this.sendCommand(`npmx gpio config drive get ${this.index}`);
    }
    openDrain() {
        this.sendCommand(`npmx gpio config open_drain get ${this.index}`);
    }
    debounce() {
        this.sendCommand(`npmx gpio config debounce get ${this.index}`);
    }
}
