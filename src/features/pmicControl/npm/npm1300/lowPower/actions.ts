/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';

export class LowPowerActions {
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {}

    enterShipMode() {
        return new Promise<void>(resolve => {
            this.sendCommand(`npmx ship mode ship`);
            resolve();
        });
    }
    enterShipHibernateMode() {
        return new Promise<void>(resolve => {
            this.sendCommand(`npmx ship mode hibernate`);
            resolve();
        });
    }
}
