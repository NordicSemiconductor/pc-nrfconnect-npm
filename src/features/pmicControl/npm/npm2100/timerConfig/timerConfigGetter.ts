/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class TimerConfigGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.mode();
        this.state();
        this.period();
    }

    mode() {
        this.sendCommand(`npm2100 timer mode get`);
    }
    state() {
        this.sendCommand(`npm2100 timer state get`);
    }
    period() {
        this.sendCommand(`npm2100 timer period get`);
    }
}
