/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type SysReg, type VBusDpm, type VBusILim } from '../../types';
import { SysRegGet } from './getters';

export class SysRegSet {
    private get: SysRegGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new SysRegGet(sendCommand);
    }

    async all(config: SysReg) {
        const promises = [
            this.vBusDpm(config.vBusDpm),
            this.vBusILim(config.vBusILim),
        ];

        await Promise.allSettled(promises);
    }

    vBusDpm(value: VBusDpm) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', {
                    vBusDpm: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 sysreg vbusdpm set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vBusDpm();
                        reject();
                    },
                );
            }
        });
    }

    vBusILim(value: VBusILim) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<SysReg>('onSysRegUpdate', {
                    vBusILim: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 sysreg vbusilim set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vBusILim();
                        reject();
                    },
                );
            }
        });
    }
}
