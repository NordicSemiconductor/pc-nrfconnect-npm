/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
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
        this.resetThreshold();
        this.status();
        this.warnThreshold();
    }

    resetThreshold() {
        this.sendCommand('npm1012 reset_ctrl pof reset_threshold get');
    }

    status() {
        this.sendCommand('npm1012 reset_ctrl pof status get');
    }

    warnThreshold() {
        this.sendCommand('npm1012 reset_ctrl pof warn_threshold get');
    }
}
