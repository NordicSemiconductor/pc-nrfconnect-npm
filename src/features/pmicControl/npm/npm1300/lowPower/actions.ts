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
        this.sendCommand(`npmx ship mode ship`);
    }
    enterShipHibernateMode() {
        this.sendCommand(`npmx ship mode hibernate`);
    }
}
