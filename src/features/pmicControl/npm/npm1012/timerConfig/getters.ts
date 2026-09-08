/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
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
        this.enabled();
        this.mode();
        this.period();
    }

    enabled() {
        this.sendCommand(`npm1012 timer state get`);
    }

    mode() {
        this.sendCommand(`npm1012 timer mode get`);
    }

    period() {
        this.sendCommand(`npm1012 timer period get`);
    }
}
