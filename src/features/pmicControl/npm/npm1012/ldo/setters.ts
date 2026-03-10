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
    LdoSoftStartCurrent,
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
        this.get = new LdoGet(sendCommand, index);
    }

    async all(ldo: LdoExport) {
        const promises = [
            this.activeDischarge(ldo.activeDischarge),
            this.enabled(ldo.enabled),
            this.onOffControl(ldo.onOffControl),
        ];

        if (ldo.mode !== undefined) {
            promises.push(this.mode(ldo.mode));
        }
        if (ldo.overcurrentProtection !== undefined) {
            promises.push(
                this.overcurrentProtection(ldo.overcurrentProtection),
            );
        }
        if (ldo.softStart !== undefined) {
            promises.push(this.softStart(ldo.softStart));
        }
        if (ldo.softStartTime !== undefined) {
            promises.push(this.softStartTime(ldo.softStartTime));
        }
        if (ldo.softStartCurrent !== undefined) {
            promises.push(this.softStartCurrent(ldo.softStartCurrent));
        }
        if (ldo.vOutSel !== undefined) {
            promises.push(this.vOutSel(ldo.vOutSel));
        }
        if (ldo.voltage !== undefined) {
            promises.push(this.voltage(ldo.voltage));
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
                    `npm1012 ldosw mode set ${this.index} ${mode}`,
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
                        `npm1012 ldosw vout software set ${this.index} ${voltage}`,
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
                    `npm1012 ldosw enable set ${this.index} ${enabled ? 'on' : 'off'}`,
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
                    `npm1012 ldosw activedischarge set ${this.index} ${activeDischarge ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.activeDischarge();
                        reject();
                    },
                );
            }
        });
    }

    overcurrentProtection(ocp: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        overcurrentProtection: ocp,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw ocp set ${this.index} ${ocp ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.overcurrentProtection();
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
                    `npm1012 ldosw enablectrl set ${this.index} ${onOffControl}`,
                    () => resolve(),
                    () => {
                        this.get.onOffControl();
                        reject();
                    },
                );
            }
        });
    }

    softStart(enable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStart: enable,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstart set ${this.index} ${
                        enable ? 'on' : 'off'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.softStart();
                        reject();
                    },
                );
            }
        });
    }

    softStartCurrent(value: LdoSoftStartCurrent) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartCurrent: value,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 ldosw softstartilim set ${this.index} ${value}`,
                    () => resolve(),
                    () => {
                        this.get.softStartCurrent();
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
                    `npm1012 ldosw softstarttime set ${this.index} ${value}`,
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
                    `npm1012 ldosw voutsel set ${this.index} ${mode.toUpperCase()}`,
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
                    `npm1012 ldosw weakpull set ${this.index} ${enable ? 'on' : 'off'}`,
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
