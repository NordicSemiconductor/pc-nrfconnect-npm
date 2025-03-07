/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class GpioGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private index: number
    ) {}

    all() {
        this.mode();
        this.state();
        this.pull();
        this.drive();
        this.openDrain();
        this.debounce();
    }

    mode() {
        this.sendCommand(`npm2100 gpio mode get ${this.index}`);
    }
    state() {
        this.sendCommand(`npm2100 gpio state get ${this.index}`);
    }
    pull() {
        this.sendCommand(`npm2100 gpio pull get ${this.index}`);
    }
    drive() {
        this.sendCommand(`npm2100 gpio drive get ${this.index}`);
    }
    openDrain() {
        this.sendCommand(`npm2100 gpio opendrain get ${this.index}`);
    }
    debounce() {
        this.sendCommand(`npm2100 gpio debounce get ${this.index}`);
    }
}
