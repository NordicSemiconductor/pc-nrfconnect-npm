/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';

export class ResetActions {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {}

    powerCycle() {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                // No action if offline
            } else {
                this.sendCommand(
                    `npm2100 reset_ctrl power_cycle set ENABLE`,
                    () => resolve(),
                    () => reject()
                );
            }
        });
    }
}
