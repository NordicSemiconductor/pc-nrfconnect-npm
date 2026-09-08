/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class PofGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.enabled();
        this.polarity();
        this.resetThreshold();
    }

    enabled() {
        this.sendCommand(`npmx pof status get`);
    }
    polarity() {
        this.sendCommand(`npmx pof polarity get`);
    }
    resetThreshold() {
        this.sendCommand(`npmx pof threshold get`);
    }
}
