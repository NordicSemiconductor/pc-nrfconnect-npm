/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    LoadSwitch,
    LoadSwitchExport,
    LoadSwitchOnOffControl,
} from '../../types';
import { LoadSwitchGet } from './getters';

export class LoadSwitchSet {
    private get: LoadSwitchGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
        private index: number,
    ) {
        this.get = new LoadSwitchGet(sendCommand);
    }

    async all(ldo: LoadSwitchExport) {
        const promises = [
            this.activeDischarge(ldo.activeDischarge),
            this.enable(ldo.enable),
            this.onOffControl(ldo.onOffControl),
        ];

        if (ldo.overCurrentProtection !== undefined) {
            promises.push(
                this.overCurrentProtection(ldo.overCurrentProtection),
            );
        }
        if (ldo.softStartCurrentLimit !== undefined) {
            promises.push(
                this.softStartCurrentLimit(ldo.softStartCurrentLimit),
            );
        }
        if (ldo.softStartTime !== undefined) {
            promises.push(this.softStartTime(ldo.softStartTime));
        }

        await Promise.allSettled(promises);
    }

    activeDischarge(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        activeDischarge: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw activedischarge set 1 ${
                        value ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.activeDischarge();
                        reject();
                    },
                );
            }
        });
    }

    enable(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        enable: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw enable set 1 ${value ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.enable();
                        reject();
                    },
                );
            }
        });
    }

    onOffControl(value: LoadSwitchOnOffControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        onOffControl: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw enablectrl set 1 ${value.toUpperCase()}`,
                    () => resolve(),
                    () => {
                        this.get.onOffControl();
                        reject();
                    },
                );
            }
        });
    }

    overCurrentProtection(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        overCurrentProtection: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw ocp set 1 ${value ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.overCurrentProtection();
                        reject();
                    },
                );
            }
        });
    }

    softStartCurrentLimit(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        softStartCurrentLimit: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstartilim set 1 ${value === 0 ? 'DISABLE' : `${value}`}`,
                    () => resolve(),
                    () => {
                        this.get.softStartCurrentLimit();
                        reject();
                    },
                );
            }
        });
    }

    softStartTime(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LoadSwitch>(
                    'onLoadSwitchUpdate',
                    {
                        softStartTime: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstarttime set 1 ${value === 0 ? 'DISABLE' : `${value}`}`,
                    () => resolve(),
                    () => {
                        this.get.softStartTime();
                        reject();
                    },
                );
            }
        });
    }
}
