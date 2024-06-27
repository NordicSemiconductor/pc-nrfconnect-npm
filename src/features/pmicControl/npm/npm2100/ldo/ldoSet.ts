/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { Ldo, LdoExport, LdoMode } from '../../types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlPinSelect,
    nPM2100LdoModeControl,
    nPM2100LDOSoftStart,
    nPM2100LoadSwitchSoftStart,
} from '../types';
import { LdoGet } from './ldoGet';

export class LdoSet {
    private get: LdoGet;
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new LdoGet(sendCommand);
    }

    async all(config: LdoExport) {
        await this.voltage(config.voltage);
        await this.enabled(config.enabled);
        await this.mode(config.mode);
        if (config.modeControl) await this.modeControl(config.modeControl);
        if (config.pinSel) await this.pinSel(config.pinSel);
        if (config.ldoSoftStart) await this.ldoSoftstart(config.ldoSoftStart);
        if (config.loadSwitchSoftStart)
            await this.loadSwitchSoftstart(config.loadSwitchSoftStart);
        if (config.pinMode) await this.pinMode(config.pinMode);
        if (config.ocpEnabled) await this.ocpEnabled(config.ocpEnabled);
        if (config.rampEnabled) await this.rampEnabled(config.rampEnabled);
        if (config.haltEnabled) await this.haltEnabled(config.haltEnabled);
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
                    0
                );
                resolve();
            } else {
                this.enabled(false).then(() => {
                    this.sendCommand(
                        `npm2100 ldosw mode set ${mode}`,
                        () => resolve(),
                        () => {
                            this.get.mode();
                            reject();
                        }
                    );
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
                0
            );

            if (this.offlineMode) {
                resolve();
            } else {
                this.mode('LDO') // Fixme: is this correct still?
                    .then(() => {
                        this.sendCommand(
                            `npm2100 ldosw vout set ${voltage * 1000}`,
                            () => resolve(),
                            () => {
                                this.get.voltage();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        this.get.mode();
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
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw enable set ${enabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    }
                );
            }
        });
    }

    ldoSoftstart(ldoSoftStart: nPM2100LDOSoftStart) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ldoSoftStart,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw softstart LDO set ${ldoSoftStart}`,
                    () => resolve(),
                    () => {
                        this.get.softStartLdo();
                        reject();
                    }
                );
            }
        });
    }

    loadSwitchSoftstart(loadSwitchSoftStart: nPM2100LoadSwitchSoftStart) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        loadSwitchSoftStart,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw softstart LOADSW set ${loadSwitchSoftStart}`,
                    () => resolve(),
                    () => {
                        this.get.softStartLoadSw();
                        reject();
                    }
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
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw modectrl set ${modeControl}`,
                    () => resolve(),
                    () => {
                        this.get.modeCtrl();
                        reject();
                    }
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
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw pinsel set ${pinSel}`,
                    () => resolve(),
                    () => {
                        this.get.pinSel();
                        reject();
                    }
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
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw pinmode set ${pinMode}`,
                    () => resolve(),
                    () => {
                        this.get.pinMode();
                        reject();
                    }
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
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ocp set ${ocpEnabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.ocp();
                        reject();
                    }
                );
            }
        });
    }

    rampEnabled(ldoRampEnabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        rampEnabled: ldoRampEnabled,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ldoramp set ${
                        ldoRampEnabled ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.ramp();
                        reject();
                    }
                );
            }
        });
    }

    haltEnabled(ldoHaltEnabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        haltEnabled: ldoHaltEnabled,
                    },
                    0
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm2100 ldosw ldohalt set ${
                        ldoHaltEnabled ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        this.get.halt();
                        reject();
                    }
                );
            }
        });
    }
}
