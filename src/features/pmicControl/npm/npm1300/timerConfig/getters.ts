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
        this.prescaler();
        this.period();
    }

    mode() {
        this.sendCommand(`npmx timer config mode get`);
    }
    prescaler() {
        this.sendCommand(`npmx timer config prescaler get`);
    }
    period() {
        this.sendCommand(`npmx timer config compare get`);
    }
}
