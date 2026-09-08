/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type NpmEventEmitter } from '../../pmicHelpers';
import { type LowPowerConfig, type TimeToActive } from '../../types';
import { LowPowerGet } from './getters';

export class LowPowerSet {
    private get: LowPowerGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private offlineMode: boolean,
    ) {
        this.get = new LowPowerGet(sendCommand);
    }

    async all(config: LowPowerConfig) {
        const promises = [this.timeToActive(config.timeToActive)];

        if (config.hibernateWakeupByButton !== undefined) {
            promises.push(
                this.hibernateWakeupByButton(config.hibernateWakeupByButton),
            );
        }
        if (config.vbusHibernateWait !== undefined) {
            promises.push(this.vbusHibernateWait(config.vbusHibernateWait));
        }
        if (config.vbusStandbyWait !== undefined) {
            promises.push(this.vbusStandbyWait(config.vbusStandbyWait));
        }

        await Promise.allSettled(promises);
    }

    hibernateWakeupByButton(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        hibernateWakeupByButton: value,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 low_power_ctrl shphld hibernate_wakeup set ${value ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.hibernateWakeupByButton();
                        reject();
                    },
                );
            }
        });
    }

    timeToActive(value: TimeToActive) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        timeToActive: value,
                    },
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 low_power_ctrl shphld debounce set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.timeToActive();
                        reject();
                    },
                );
            }
        });
    }

    vbusHibernateWait(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            const onSuccess = () => {
                this.eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        vbusHibernateWait: value,
                        vbusHibernateWaitingForChargeComplete: false,
                    },
                );
                resolve();
            };

            if (this.offlineMode) {
                onSuccess();
            } else {
                this.sendCommand(
                    `npm1012 low_power_ctrl vbus hibernate_wait set ${value ? 'on' : 'off'}`,
                    onSuccess,
                    () => {
                        this.get.vbusHibernateWait();
                        reject();
                    },
                );
            }
        });
    }

    vbusStandbyWait(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            const onSuccess = () => {
                this.eventEmitter.emitPartialEvent<LowPowerConfig>(
                    'onLowPowerUpdate',
                    {
                        vbusStandbyWait: value,
                        vbusStandbyWaitingForChargeComplete: false,
                    },
                );
                resolve();
            };

            if (this.offlineMode) {
                onSuccess();
            } else {
                this.sendCommand(
                    `npm1012 low_power_ctrl vbus standby_wait set ${value ? 'on' : 'off'}`,
                    onSuccess,
                    () => {
                        this.get.vbusStandbyWait();
                        reject();
                    },
                );
            }
        });
    }
}
