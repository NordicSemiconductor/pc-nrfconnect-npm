/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter, parseColonBasedAnswer } from '../../pmicHelpers';
import {
    Ldo,
    LdoExport,
    LdoMode,
    LdoSoftStartCurrent,
    PmicDialog,
} from '../../types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlPinSelect,
    nPM2100LdoModeControl,
} from '../types';
import { LdoGet } from './ldoGet';

export class LdoSet {
    private get: LdoGet;
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private dialogHandler: ((dialog: PmicDialog) => void) | null,
        private offlineMode: boolean,
    ) {
        this.get = new LdoGet(sendCommand);
    }

    async all(config: LdoExport) {
        const promises = [this.enabled(config.enabled)];

        if (config.mode) promises.push(this.mode(config.mode));
        if (config.modeControl)
            promises.push(this.modeControl(config.modeControl));
        if (config.pinSel) promises.push(this.pinSel(config.pinSel));
        if (config.softStartCurrent)
            promises.push(
                this.softStartCurrent(config.softStartCurrent, config.mode),
            );
        if (config.pinMode) promises.push(this.pinMode(config.pinMode));
        if (config.overcurrentProtection)
            promises.push(
                this.overcurrentProtection(config.overcurrentProtection),
            );
        if (config.ramp) promises.push(this.ramp(config.ramp));
        if (config.halt) promises.push(this.halt(config.halt));
        if (config.voltage) promises.push(this.voltage(config.voltage));

        await Promise.allSettled(promises);
    }

    mode(mode: LdoMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        mode,
                        enabled: false,
                    },
                    0,
                );
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npm2100 ldosw mode set ${mode}`,
                            () => resolve(),
                            () => {
                                this.get.mode();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        reject();
                    });
            }
        });
    }

    voltage(voltage: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Ldo>(
                'onLdoUpdate',
                {
                    voltage,
                },
                0,
            );

            if (this.offlineMode) {
                resolve();
            } else {
                this.mode('LDO') // Fixme: is this correct still?
                    .then(() => {
                        this.sendCommand(
                            `npm2100 ldosw vout set ${voltage * 1000}`,
                            () => resolve(),
                            response => {
                                this.get.voltage();
                                this.dialogHandler?.({
                                    type: 'alert',
                                    doNotAskAgainStoreID: `pmic2100-setLDOVoltage`,
                                    message: `${parseColonBasedAnswer(
                                        response,
                                    )}.`,
                                    confirmLabel: 'OK',
                                    optionalLabel: "OK, don't ask again",
                                    title: 'Error',
                                    onConfirm: () => {},
                                });

                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        reject();
                    });
            }
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
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw enable set ${enabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    softStartCurrent(value: LdoSoftStartCurrent, mode?: LdoMode) {
        return new Promise<void>((resolve, reject) => {
            if (mode === undefined) {
                resolve();
                return;
            }

            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    mode === 'LDO'
                        ? { softStartCurrentLDOMode: value }
                        : { softStartCurrentLoadSwitchMode: value },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw softstart ${mode === 'LDO' ? 'LDO' : 'LOADSW'} set ${value}mA`,
                    () => resolve(),
                    () => {
                        this.get.softStartCurrent(mode);
                        reject();
                    },
                );
            }
        });
    }

    modeControl(modeControl: nPM2100LdoModeControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        modeControl,
                    },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw modectrl set ${modeControl}`,
                    () => resolve(),
                    () => {
                        this.get.modeCtrl();
                        reject();
                    },
                );
            }
        });
    }

    pinSel(pinSel: nPM2100GPIOControlPinSelect) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        pinSel,
                    },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw pinsel set ${pinSel}`,
                    () => resolve(),
                    () => {
                        this.get.pinSel();
                        reject();
                    },
                );
            }
        });
    }

    pinMode(pinMode: nPM2100GPIOControlMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        pinMode,
                    },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw pinmode set ${pinMode}`,
                    () => resolve(),
                    () => {
                        this.get.pinMode();
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
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ocp set ${ocp ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.ocp();
                        reject();
                    },
                );
            }
        });
    }

    ramp(enable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ramp: enable,
                    },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ldoramp set ${enable ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.ramp();
                        reject();
                    },
                );
            }
        });
    }

    halt(enable: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        halt: enable,
                    },
                    0,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ldohalt set ${enable ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.halt();
                        reject();
                    },
                );
            }
        });
    }
}
