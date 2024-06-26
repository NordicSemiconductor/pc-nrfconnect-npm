/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export class ShipModeGet {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void
    ) {}

    all() {
        this.timeToActive();
        this.longPressReset();
    }

    timeToActive() {
        this.sendCommand(`npmx ship config time get`);
    }
    longPressReset() {
        this.sendCommand(`powerup_ship longpress get`);
    }
}
