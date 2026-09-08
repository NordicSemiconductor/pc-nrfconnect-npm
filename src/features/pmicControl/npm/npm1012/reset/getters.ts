/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class ResetGet {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    all() {
        this.longPressResetEnable();
        this.longPressResetDebounce();
        this.longPressResetPinSel();
        this.powerDownWait();
    }

    longPressResetDebounce() {
        this.sendCommand(`npm1012 reset_ctrl long_press_reset debounce get`);
    }
    longPressResetEnable() {
        this.sendCommand(`npm1012 reset_ctrl long_press_reset enable get`);
    }
    longPressResetPinSel() {
        this.sendCommand(`npm1012 reset_ctrl long_press_reset pinsel get`);
    }
    powerDownWait() {
        this.sendCommand(`npm1012 reset_ctrl powerdown_wait get`);
    }
}
