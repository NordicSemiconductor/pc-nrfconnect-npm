/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Ldo,
    LdoExport,
    LdoMode,
    LdoOnOffControl,
    LdoVOutSel,
} from '../../types';
import { LdoGet } from './getters';

export class LdoSet {
    private get: LdoGet;

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
        this.get = new LdoGet(sendCommand);
    }

    async all(ldo: LdoExport) {
        const promises = [
            this.activeDischarge(ldo.activeDischarge),
            this.enabled(ldo.enabled),
            this.mode(ldo.mode),
            this.onOffControl(ldo.onOffControl),
            this.voltage(ldo.voltage),
        ];

        if (ldo.ocpEnabled !== undefined) {
            promises.push(this.ocpEnabled(ldo.ocpEnabled));
        }
        if (ldo.softStartTime !== undefined) {
            promises.push(this.softStartTime(ldo.softStartTime));
        }
        if (ldo.softStartCurrentLimit !== undefined) {
            promises.push(
                this.softStartCurrentLimit(ldo.softStartCurrentLimit),
            );
        }
        if (ldo.vOutSel !== undefined) {
            promises.push(this.vOutSel(ldo.vOutSel));
        }
        if (ldo.weakPullDown !== undefined) {
            promises.push(this.weakPullDown(ldo.weakPullDown));
        }

        await Promise.allSettled(promises);
    }

    mode(mode: LdoMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        mode,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw mode set 0 ${mode}`,
                    () => resolve(),
                    () => {
                        this.get.mode();
                        reject();
                    },
                );
            }
        });
    }

    voltage(voltage: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        voltage,
                    },
                    this.index,
                );
                resolve();
                return;
            }

            this.mode('LDO')
                .then(() => {
                    this.sendCommand(
                        `npm1012 ldosw vout software set 0 ${voltage}`,
                        () => resolve(),
                        () => {
                            this.get.voltage();
                            reject();
                        },
                    );
                })
                .catch(() => {
                    this.get.voltage();
                    reject();
                });
        });
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        enabled,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw enable set 0 ${enabled ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    activeDischarge(activeDischarge: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        activeDischarge,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw activedischarge set 0 ${activeDischarge ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.activeDischarge();
                        reject();
                    },
                );
            }
        });
    }

    ocpEnabled(ocpEnabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ocpEnabled,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw ocp set 0 ${ocpEnabled ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.ocp();
                        reject();
                    },
                );
            }
        });
    }

    onOffControl(onOffControl: LdoOnOffControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        onOffControl,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw enablectrl set 0 ${onOffControl}`,
                    () => resolve(),
                    () => {
                        this.get.onOffControl();
                        reject();
                    },
                );
            }
        });
    }

    softStartCurrentLimit(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartCurrentLimit: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstartilim set 0 ${value === 0 ? 'DISABLE' : `${value}`}`,
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
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartTime: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstarttime set 0 ${value === 0 ? 'DISABLE' : `${value}`}`,
                    () => resolve(),
                    () => {
                        this.get.softStartTime();
                        reject();
                    },
                );
            }
        });
    }

    vOutSel(mode: LdoVOutSel) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        vOutSel: mode,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw voutsel set 0 ${mode.toUpperCase()}`,
                    () => resolve(),
                    () => {
                        this.get.vOutSel();
                        reject();
                    },
                );
            }
        });
    }

    weakPullDown(enable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        weakPullDown: enable,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw weakpull set 0 ${enable ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.weakPullDown();
                        reject();
                    },
                );
            }
        });
    }
}
