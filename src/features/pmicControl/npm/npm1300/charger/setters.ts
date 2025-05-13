/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { Charger, ITerm, NTCThermistor, VTrickleFast } from '../../types';
import { ChargerGet } from './getters';

export class ChargerSet {
    private get: ChargerGet;

    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {
        this.get = new ChargerGet(sendCommand);
    }

    async all(charger: Charger) {
        await this.vTerm(charger.vTerm);
        await this.iChg(charger.iChg);
        await this.iTerm(charger.iTerm);
        await this.batLim(charger.iBatLim);
        await this.enabledRecharging(charger.enableRecharging);
        await this.enabledVBatLow(charger.enableVBatLow);
        await this.vTrickleFast(charger.vTrickleFast);
        await this.nTCThermistor(charger.ntcThermistor);
        await this.nTCBeta(charger.ntcBeta);
        await this.tChgResume(charger.tChgResume);
        await this.tChgStop(charger.tChgStop);
        await this.vTermR(charger.vTermR);
        await this.tCold(charger.tCold);
        await this.tCool(charger.tCool);
        await this.tWarm(charger.tWarm);
        await this.tHot(charger.tHot);
        await this.enabled(charger.enabled);
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
                    }
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
                            }
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
                            `npmx charger charging_current set ${value}`,
                            () => resolve(),
                            () => {
                                this.get.iChg();
                                reject();
                            }
                        )
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
                            }
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
                            }
                        );
                    })
                    .catch(() => {
                        this.get.iTerm();
                        reject();
                    });
            }
        });
    }

    batLim(iBatLim: number) {
        return new Promise<void>((resolve, reject) => {
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
                                this.get.batLim();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        this.get.batLim();
                        reject();
                    });
            }
        });
    }

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
                    }
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
                    }
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
                            }
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
                            }
                        )
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
                    }
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
                    }
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
                    }
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
                    }
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
                    }
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
                    }
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
                    }
                );
            }
        });
    }
}
