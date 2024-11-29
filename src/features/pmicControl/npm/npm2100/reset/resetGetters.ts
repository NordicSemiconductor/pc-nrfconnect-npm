/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class ResetGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.pinSelection();
        this.longPressReset();
        this.longPressResetDebounce();
        this.resetReason();
    }

    pinSelection() {
        this.sendCommand(`npm2100 reset_ctrl pin_selection get`);
    }

    longPressReset() {
        this.sendCommand(`npm2100 reset_ctrl long_press_reset get`);
    }

    longPressResetDebounce() {
        this.sendCommand(`npm2100 reset_ctrl long_press_reset_debounce get`);
    }
    resetReason() {
        this.sendCommand(`npm2100 reset_ctrl reset_reason get`);
    }
}
