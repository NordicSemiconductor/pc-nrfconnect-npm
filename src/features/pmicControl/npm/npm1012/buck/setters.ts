/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Buck,
    BuckAlternateVOutControl,
    BuckExport,
    BuckMode,
    BuckModeControl,
    BuckOnOffControl,
    BuckVOutRippleControl,
} from '../../types';
import { BuckGet } from './getters';
import {
    BuckModeControl1012,
    BuckModeControlValues1012,
    BuckOnOffControl1012,
    BuckOnOffControlValues1012,
} from './types';

export class BuckSet {
    private get: BuckGet;

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
        this.get = new BuckGet(sendCommand);
    }

    async all(config: BuckExport) {
        const promises = [
            this.vOutNormal(config.vOutNormal),
            this.enabled(config.enabled),
            this.modeControl(config.modeControl),
            this.onOffControl(config.onOffControl),
            this.mode(config.mode),
        ];
        if (config.activeDischargeResistance !== undefined) {
            promises.push(
                this.activeDischargeResistance(
                    config.activeDischargeResistance,
                ),
            );
        }
        if (config.alternateVOut !== undefined) {
            promises.push(this.alternateVOut(config.alternateVOut));
        }
        if (config.alternateVOutControl !== undefined) {
            promises.push(
                this.alternateVOutControl(config.alternateVOutControl),
            );
        }
        if (config.automaticPassthrough !== undefined) {
            promises.push(
                this.automaticPassthrough(config.automaticPassthrough),
            );
        }
        if (config.peakCurrentLimit !== undefined) {
            promises.push(this.peakCurrentLimit(config.peakCurrentLimit));
        }
        if (config.quickVOutDischarge !== undefined) {
            promises.push(this.quickVOutDischarge(config.quickVOutDischarge));
        }
        if (config.shortCircuitProtection !== undefined) {
            promises.push(
                this.shortCircuitProtection(config.shortCircuitProtection),
            );
        }
        if (config.softStartPeakCurrentLimit !== undefined) {
            promises.push(
                this.softStartPeakCurrentLimit(
                    config.softStartPeakCurrentLimit,
                ),
            );
        }
        if (config.vOutComparatorBiasCurrent !== undefined) {
            promises.push(
                this.vOutComparatorBiasCurrent(
                    config.modeControl,
                    config.vOutComparatorBiasCurrent,
                ),
            );
        }
        if (config.vOutRippleControl !== undefined) {
            promises.push(this.vOutRippleControl(config.vOutRippleControl));
        }

        await Promise.allSettled(promises);
    }

    vOutNormal(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutNormal: value,
                    },
                    this.index,
                );

                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        mode: 'software',
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck vout software set 0 ${value}V`,
                    () =>
                        this.sendCommand(
                            `npm1012 buck voutsel set VOUT1`,
                            () => resolve(),
                            () => {
                                this.get.mode();
                                reject();
                            },
                        ),
                    () => {
                        this.get.vOutNormal();
                        reject();
                    },
                );
            }
        });
    }

    mode(mode: BuckMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        mode,
                    },
                    this.index,
                );
                resolve();
            } else {
                const value = mode === 'software' ? 'ON' : 'VSET';
                this.sendCommand(
                    `npm1012 buck enable set ${value}`,
                    () => {
                        this.get.vOutNormal();
                        resolve();
                    },
                    () => {
                        this.get.mode();
                        reject();
                    },
                );
            }
        });
    }

    modeControl(modeControl: BuckModeControl) {
        return new Promise<void>((resolve, reject) => {
            if (
                !BuckModeControlValues1012.includes(
                    modeControl as BuckModeControl1012,
                )
            ) {
                reject();
                return;
            }

            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        modeControl,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck pwrmode set ${modeControl}`,
                    () => resolve(),
                    () => {
                        this.get.modeControl();
                        reject();
                    },
                );
            }
        });
    }

    onOffControl(onOffControl: BuckOnOffControl) {
        return new Promise<void>((resolve, reject) => {
            if (
                !BuckOnOffControlValues1012.includes(
                    onOffControl as BuckOnOffControl1012,
                )
            ) {
                reject();
                return;
            }

            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        onOffControl,
                    },
                    this.index,
                );

                resolve();
            } else {
                const value = onOffControl === 'Software' ? 'ON' : onOffControl;
                this.sendCommand(
                    `npm1012 buck enable set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.onOffControl();
                        reject();
                    },
                );
            }
        });
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        enabled,
                    },
                    this.index,
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck enable set ${enabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    activeDischargeResistance(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        activeDischargeResistance: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck pulldown set ${value === 0 ? 'DISABLE' : `${value}Ohm`}`,
                    () => resolve(),
                    () => {
                        this.get.activeDischargeResistance();
                        reject();
                    },
                );
            }
        });
    }

    alternateVOut(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        mode: 'software',
                        alternateVOut: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck vout software set 1 ${value}V`,
                    () => resolve(),
                    () => {
                        this.get.alternateVOut();
                        reject();
                    },
                );
            }
        });
    }

    alternateVOutControl(modeControl: BuckAlternateVOutControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        alternateVOutControl: modeControl,
                    },
                    this.index,
                );

                resolve();
            } else {
                let cmd = '';
                switch (modeControl) {
                    case 'GPIO': {
                        cmd = 'GPIO';
                        break;
                    }
                    case 'Off': {
                        cmd = 'VSET';
                        break;
                    }
                    case 'Software': {
                        cmd = 'VOUT2';
                        break;
                    }
                }

                this.sendCommand(
                    `npm1012 buck voutsel set ${cmd}`,
                    () => resolve(),
                    () => {
                        this.get.alternateVOutControl();
                        reject();
                    },
                );
            }
        });
    }

    automaticPassthrough(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        automaticPassthrough: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck passthrough set ${value ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.automaticPassthrough();
                        reject();
                    },
                );
            }
        });
    }

    quickVOutDischarge(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        quickVOutDischarge: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck autopull set ${value ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.quickVOutDischarge();
                        reject();
                    },
                );
            }
        });
    }

    peakCurrentLimit(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        peakCurrentLimit: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck peakilim set ${value}mA`,
                    () => resolve(),
                    () => {
                        this.get.peakCurrentLimit();
                        reject();
                    },
                );
            }
        });
    }

    shortCircuitProtection(value: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        shortCircuitProtection: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck scprotect set ${value ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.shortCircuitProtection();
                        reject();
                    },
                );
            }
        });
    }

    softStartPeakCurrentLimit(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        softStartPeakCurrentLimit: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck softstartilim set ${value}mA`,
                    () => resolve(),
                    () => {
                        this.get.softStartPeakCurrentLimit();
                        reject();
                    },
                );
            }
        });
    }

    vOutComparatorBiasCurrent(mode: BuckModeControl, value: number) {
        return new Promise<void>((resolve, reject) => {
            switch (mode) {
                case 'LP':
                    break;
                case 'ULP':
                    break;
                default:
                    reject();
                    return;
            }

            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutComparatorBiasCurrent: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                const unitPrefix = mode === 'LP' ? 'u' : 'n';
                this.sendCommand(
                    `npm1012 buck bias ${mode.toLowerCase()} set ${value}${unitPrefix}A`,
                    () => resolve(),
                    () => {
                        this.get.vOutComparatorBiasCurrent(mode);
                        reject();
                    },
                );
            }
        });
    }

    vOutRippleControl(value: BuckVOutRippleControl) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Buck>(
                    'onBuckUpdate',
                    {
                        vOutRippleControl: value,
                    },
                    this.index,
                );

                resolve();
            } else {
                this.sendCommand(
                    `npm1012 buck ripple set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vOutRippleControl();
                        reject();
                    },
                );
            }
        });
    }
}
