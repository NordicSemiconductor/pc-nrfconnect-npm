/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Charger,
    ChargerModuleSetBase,
    ITerm,
    NTCThermistor,
    VTrickleFast,
} from '../../types';

export class ChargerSet extends ChargerModuleSetBase {
    async all(charger: Charger) {
        const promises = [
            this.vTerm(charger.vTerm),
            this.iChg(charger.iChg),
            this.iTerm(charger.iTerm),
        ];

        if (charger.iBatLim && this.batLim) {
            promises.push(this.batLim(charger.iBatLim));
        }

        promises.push(
            this.enabledRecharging(charger.enableRecharging),
            this.enabledVBatLow(charger.enableVBatLow),
            this.vTrickleFast(charger.vTrickleFast),
            this.nTCThermistor(charger.ntcThermistor),
            this.nTCBeta(charger.ntcBeta),
            this.tChgResume(charger.tChgResume),
            this.tChgStop(charger.tChgStop),
            this.vTermR(charger.vTermR),
            this.tCold(charger.tCold),
            this.tCool(charger.tCool),
            this.tWarm(charger.tWarm),
            this.tHot(charger.tHot),
            this.enabled(charger.enabled),
        );

        await Promise.allSettled(promises);
    }

    enabled(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    () => {
                        resolve();
                    },
                    () => {
                        this.get.enabled();
                        reject();
                    },
                );
            }
        });
    }

    vTerm(value: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                vTerm: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx charger termination_voltage normal set ${
                                value * 1000
                            }`, // mv to V
                            () => resolve(),
                            () => {
                                this.get.vTerm();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.vTerm();
                        reject();
                    });
            }
        });
    }

    iChg(value: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iChg: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() =>
                        this.sendCommand(
                            `npmx charger charging_current set ${value * 1000}`, // mA to uA
                            () => resolve(),
                            () => {
                                this.get.iChg();
                                reject();
                            },
                        ),
                    )
                    .catch(() => {
                        this.get.iChg();
                        reject();
                    });
            }
        });
    }

    vTrickleFast(value: VTrickleFast) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                vTrickleFast: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx charger trickle_voltage set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                this.get.vTrickleFast();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.vTrickleFast();
                        reject();
                    });
            }
        });
    }

    iTerm(iTerm: ITerm) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iTerm,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx charger termination_current set ${iTerm}`,
                            () => resolve(),
                            () => {
                                this.get.iTerm();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.iTerm();
                        reject();
                    });
            }
        });
    }

    batLim: ((iBatLim: number) => Promise<void>) | undefined = (
        iBatLim: number,
    ) =>
        new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iBatLim,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npm_adc fullscale set ${iBatLim}`,
                            () => resolve(),
                            () => {
                                this.get.batLim?.();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.batLim?.();
                        reject();
                    });
            }
        });

    enabledRecharging(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableRecharging: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledRecharging();
                        reject();
                    },
                );
            }
        });
    }

    enabledVBatLow(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableVBatLow: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `powerup_charger vbatlow set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledVBatLow();
                        reject();
                    },
                );
            }
        });
    }

    nTCThermistor(mode: NTCThermistor, autoSetBeta?: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                ntcThermistor: mode,
            });

            let value = 0;
            let ntcBeta = 0;
            switch (mode) {
                case '100 kΩ':
                    value = 100000;
                    ntcBeta = 4250;
                    break;
                case '47 kΩ':
                    value = 47000;
                    ntcBeta = 4050;
                    break;
                case '10 kΩ':
                    value = 10000;
                    ntcBeta = 3380;
                    break;
                case 'Ignore NTC':
                    value = 0;
                    break;
            }

            if (autoSetBeta && mode !== 'Ignore NTC') {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    ntcBeta,
                });
            }

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx adc ntc type set ${value}`,
                            () => {
                                if (autoSetBeta && mode !== 'Ignore NTC') {
                                    this.nTCBeta(ntcBeta)
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    resolve();
                                }
                            },
                            () => {
                                this.get.nTCThermistor();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.nTCThermistor();
                        reject();
                    });
            }
        });
    }

    nTCBeta(ntcBeta: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                ntcBeta,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() =>
                        this.sendCommand(
                            `npmx adc ntc beta set ${ntcBeta}`,
                            () => {
                                resolve();
                            },
                            () => {
                                this.get.nTCBeta();
                                reject();
                            },
                        ),
                    )
                    .catch(reject);
            }
        });
    }

    tChgStop(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgStop: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger die_temp stop set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tChgStop();
                        reject();
                    },
                );
            }
        });
    }

    tChgResume(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgResume: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger die_temp resume set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tChgResume();
                        reject();
                    },
                );
            }
        });
    }

    vTermR(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermR: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger termination_voltage warm set ${value * 1000}`,
                    () => resolve(),
                    () => {
                        this.get.vTermR();
                        reject();
                    },
                );
            }
        });
    }

    tCold(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCold: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger ntc_temperature cold set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tCold();
                        reject();
                    },
                );
            }
        });
    }

    tCool(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCool: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger ntc_temperature cool set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tCool();
                        reject();
                    },
                );
            }
        });
    }

    tWarm(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tWarm: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger ntc_temperature warm set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tWarm();
                        reject();
                    },
                );
            }
        });
    }

    tHot(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tHot: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger ntc_temperature hot set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tHot();
                        reject();
                    },
                );
            }
        });
    }
}
