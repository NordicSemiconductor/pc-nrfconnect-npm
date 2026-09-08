/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
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
        this.longPressResetDebounce();
        this.longPressResetEnable();
        this.longPressResetPinSel();
        this.resetReason();
    }

    longPressResetDebounce() {
        this.sendCommand(`npm2100 reset_ctrl long_press_reset_debounce get`);
    }

    longPressResetEnable() {
        this.sendCommand(`npm2100 reset_ctrl long_press_reset get`);
    }

    longPressResetPinSel() {
        this.sendCommand(`npm2100 reset_ctrl pin_selection get`);
    }

    resetReason() {
        this.sendCommand(`npm2100 reset_ctrl reset_reason get`);
    }
}
