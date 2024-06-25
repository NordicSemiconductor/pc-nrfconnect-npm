/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class BoostGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.vOut();
        this.mode();
        this.modeControl();
        this.pinSelection();
        this.pinMode();
        this.overCurrent();
    }

    vOut() {
        this.sendCommand(`npm2100 boost vout get`);
    }

    mode() {
        this.sendCommand(`npm2100 boost mode get`);
    }

    modeControl() {
        this.sendCommand(`npm2100 boost voutsel get`);
    }

    pinSelection() {
        this.sendCommand(`npm2100 boost pinsel get`);
    }

    pinMode() {
        this.sendCommand(`npm2100 boost pinmode get`);
    }

    overCurrent() {
        this.sendCommand(`npm2100 boost ocp get`);
    }
}
