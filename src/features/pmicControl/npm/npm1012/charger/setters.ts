/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Charger,
    ChargerJeitaILabel,
    ChargerJeitaVLabel,
    ChargerModuleSetBase,
    ITerm,
    ITrickle,
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
        if (charger.iTrickle && this.iTrickle) {
            promises.push(this.iTrickle(charger.iTrickle));
        }
        if (
            charger.enableWeakBatteryCharging !== undefined &&
            this.enabledWeakBatteryCharging
        ) {
            promises.push(
                this.enabledWeakBatteryCharging(
                    charger.enableWeakBatteryCharging,
                ),
            );
        }
        if (charger.vWeak && this.vWeak) {
            promises.push(this.vWeak(charger.vWeak));
        }
        if (charger.iChgCool !== undefined && this.iChgCool) {
            promises.push(this.iChgCool(charger.iChgCool));
        }
        if (charger.iChgWarm !== undefined && this.iChgWarm) {
            promises.push(this.iChgWarm(charger.iChgWarm));
        }
        if (charger.vTermCool !== undefined && this.vTermCool) {
            promises.push(this.vTermCool(charger.vTermCool));
        }
        if (charger.vTermWarm !== undefined && this.vTermWarm) {
            promises.push(this.vTermWarm(charger.vTermWarm));
        }
        if (
            charger.enableAdvancedChargingProfile !== undefined &&
            this.enableAdvancedChargingProfile
        ) {
            promises.push(
                this.enableAdvancedChargingProfile(
                    charger.enableAdvancedChargingProfile,
                ),
            );
        }
        if (
            charger.enableNtcMonitoring !== undefined &&
            this.enableNtcMonitoring
        ) {
            promises.push(
                this.enableNtcMonitoring(charger.enableNtcMonitoring),
            );
        }

        promises.push(
            this.enabledRecharging(charger.enableRecharging),
            this.enabledVBatLow(charger.enableVBatLow),
            this.tChgResume(charger.tChgResume),
            this.tChgStop(charger.tChgStop),
            this.vTermR(charger.vTermR),
            this.vTrickleFast(charger.vTrickleFast),
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

    iTrickle(iTrickle: ITrickle) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iTrickle,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx charger trickle_current set ${iTrickle}`,
                            () => resolve(),
                            () => {
                                this.get.iTrickle?.();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.iTrickle?.();
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
                    },
                );
            }
        });
    }

    enabledWeakBatteryCharging(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableWeakBatteryCharging: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger module weak_charge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledWeakBatteryCharging?.();
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

    vWeak(value: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                vWeak: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() => {
                        this.sendCommand(
                            `npmx charger weak_voltage set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                this.get.vWeak?.();
                                reject();
                            },
                        );
                    })
                    .catch(() => {
                        this.get.vWeak?.();
                        reject();
                    });
            }
        });
    }

    enableAdvancedChargingProfile(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                enableAdvancedChargingProfile: enabled,
                jeitaILabelCool: enabled
                    ? ChargerJeitaILabel.coolIChgCool
                    : ChargerJeitaILabel.coolIChg50percent,
                jeitaVLabelCool: enabled
                    ? ChargerJeitaVLabel.coolVTermCool
                    : ChargerJeitaVLabel.coolVTerm,
                jeitaILabelWarm: enabled
                    ? ChargerJeitaILabel.warmIChgWarm
                    : ChargerJeitaILabel.warmIChg,
                jeitaVLabelWarm: enabled
                    ? ChargerJeitaVLabel.warmVTermWarm
                    : ChargerJeitaVLabel.warmVTerm100mVOff,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger advanced_charging_profile enable set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledAdvancedChargingProfile?.();
                        reject();
                    },
                );
            }
        });
    }

    enableNtcMonitoring(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                enableNtcMonitoring: enabled,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger ntc_monitoring enable set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledNtcMonitoring?.();
                        reject();
                    },
                );
            }
        });
    }

    iChgCool(value: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iChgCool: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() =>
                        this.sendCommand(
                            `npmx charger charging_current cool set ${value * 1000}`, // mA to uA
                            () => resolve(),
                            () => {
                                this.get.iChgCool?.();
                                reject();
                            },
                        ),
                    )
                    .catch(() => {
                        this.get.iChgCool?.();
                        reject();
                    });
            }
        });
    }

    iChgWarm(value: number) {
        return new Promise<void>((resolve, reject) => {
            this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iChgWarm: value,
            });

            if (this.offlineMode) {
                resolve();
            } else {
                this.enabled(false)
                    .then(() =>
                        this.sendCommand(
                            `npmx charger charging_current warm set ${value * 1000}`, // mA to uA
                            () => resolve(),
                            () => {
                                this.get.iChgWarm?.();
                                reject();
                            },
                        ),
                    )
                    .catch(() => {
                        this.get.iChgWarm?.();
                        reject();
                    });
            }
        });
    }

    vTermCool(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermCool: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger termination_voltage cool set ${value * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        this.get.vTermCool?.();
                        reject();
                    },
                );
            }
        });
    }

    vTermWarm(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermWarm: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npmx charger termination_voltage warm set ${value * 1000}`, // V to mV
                    () => resolve(),
                    () => {
                        this.get.vTermWarm?.();
                        reject();
                    },
                );
            }
        });
    }
}
