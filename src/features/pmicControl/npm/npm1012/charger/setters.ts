/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Charger,
    ChargerModuleSetBase,
    ITerm,
    ITrickle,
    VTrickleFast,
} from '../../types';
import { advancedChargingProfileOnUpdate } from './helpers';

export class ChargerSet extends ChargerModuleSetBase {
    async all(charger: Charger) {
        const promises = [
            this.vTerm(charger.vTerm),
            this.iChg(charger.iChg),
            this.iTerm(charger.iTerm),
        ];

        if (charger.iTrickle !== undefined && this.iTrickle) {
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
        if (charger.vWeak !== undefined && this.vWeak) {
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

        if (
            charger.enableChargeCurrentThrottling !== undefined &&
            this.enableChargeCurrentThrottling
        ) {
            promises.push(
                this.enableChargeCurrentThrottling(
                    charger.enableChargeCurrentThrottling,
                ),
            );
        }
        if (
            charger.enableBatteryDischargeCurrentLimit !== undefined &&
            this.enableBatteryDischargeCurrentLimit
        ) {
            promises.push(
                this.enableBatteryDischargeCurrentLimit(
                    charger.enableBatteryDischargeCurrentLimit,
                ),
            );
        }
        if (charger.iThrottle !== undefined && this.iThrottle) {
            promises.push(this.iThrottle(charger.iThrottle));
        }
        if (charger.tOutCharge !== undefined && this.tOutCharge) {
            promises.push(this.tOutCharge(charger.tOutCharge));
        }
        if (charger.tOutTrickle !== undefined && this.tOutTrickle) {
            promises.push(this.tOutTrickle(charger.tOutTrickle));
        }
        if (charger.vBatLow !== undefined && this.vBatLow) {
            promises.push(this.vBatLow(charger.vBatLow));
        }
        if (charger.vThrottle !== undefined && this.vThrottle) {
            promises.push(this.vThrottle(charger.vThrottle));
        }

        promises.push(
            this.enabledRecharging(charger.enableRecharging),
            this.enabledVBatLow(charger.enableVBatLow),
            this.tChgResume(charger.tChgResume),
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
                    `npm1012 charger enable set ${enabled ? 'on' : 'off'}`,
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
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTerm: value,
                });
                resolve();
                return;
            }

            this.enabled(false)
                .then(() => {
                    this.sendCommand(
                        `npm1012 charger voltage termination set ${value}`,
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
        });
    }

    iChg(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChg: value,
                });
                resolve();
                return;
            }

            this.enabled(false)
                .then(() =>
                    this.sendCommand(
                        `npm1012 charger current charge set ${value}`,
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
        });
    }

    vTrickleFast(value: VTrickleFast) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTrickleFast: value,
                });
                resolve();
                return;
            }

            this.enabled(false)
                .then(() => {
                    this.sendCommand(
                        `npm1012 charger voltage trickle set ${value}`,
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
        });
    }

    iTerm(iTerm: ITerm) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iTerm,
                });
                resolve();
                return;
            }

            this.enabled(false)
                .then(() => {
                    this.sendCommand(
                        `npm1012 charger current termination set ${iTerm}`,
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
        });
    }

    iTrickle(iTrickle: ITrickle) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iTrickle,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger current trickle set ${iTrickle}`,
                    () => resolve(),
                    () => {
                        this.get.iTrickle?.();
                        reject();
                    },
                );
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
                    `npm1012 charger recharge set ${enabled ? 'on' : 'off'}`,
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
                    `npm1012 charger weakbat_charging set ${enabled ? 'on' : 'off'}`,
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
                    `npm1012 charger lowbat_charging set ${enabled ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledVBatLow();
                        reject();
                    },
                );
            }
        });
    }

    tChgReduce(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgReduce: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger dietemp reduce set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tChgReduce?.();
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
                    `npm1012 charger dietemp resume set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tChgResume();
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
                    `npm1012 charger ntc cold set ${value}`,
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
                    `npm1012 charger ntc cool set ${value}`,
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
                    `npm1012 charger ntc warm set ${value}`,
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
                    `npm1012 charger ntc hot set ${value}`,
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
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vWeak: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger voltage weak set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vWeak?.();
                        reject();
                    },
                );
            }
        });
    }

    enableAdvancedChargingProfile(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>(
                    'onChargerUpdate',
                    advancedChargingProfileOnUpdate(enabled),
                );
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger jeita_charging set ${enabled ? 'on' : 'off'}`,
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
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableNtcMonitoring: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger ntc monitoring set ${enabled ? 'on' : 'off'}`,
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
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChgCool: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger current charge_cool set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.iChgCool?.();
                        reject();
                    },
                );
            }
        });
    }

    iChgWarm(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iChgWarm: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger current charge_warm set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.iChgWarm?.();
                        reject();
                    },
                );
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
                    `npm1012 charger voltage termination_cool set ${value}`,
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
                    `npm1012 charger voltage termination_warm set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vTermWarm?.();
                        reject();
                    },
                );
            }
        });
    }

    enableBatteryDischargeCurrentLimit(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableBatteryDischargeCurrentLimit: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger discharge_limit set ${enabled ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledBatteryDischargeCurrentLimit?.();
                        reject();
                    },
                );
            }
        });
    }

    enableChargeCurrentThrottling(enabled: boolean) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableChargeCurrentThrottling: enabled,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger throttling set ${enabled ? 'on' : 'off'}`,
                    () => resolve(),
                    () => {
                        this.get.enabledChargeCurrentThrottling?.();
                        reject();
                    },
                );
            }
        });
    }

    iThrottle(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    iThrottle: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger current throttle set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.iThrottle?.();
                        reject();
                    },
                );
            }
        });
    }

    tOutCharge(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tOutCharge: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger timeout charging set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tOutCharge?.();
                        reject();
                    },
                );
            }
        });
    }

    tOutTrickle(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tOutTrickle: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger timeout trickle set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.tOutTrickle?.();
                        reject();
                    },
                );
            }
        });
    }

    vThrottle(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vThrottle: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger voltage throttle set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vThrottle?.();
                        reject();
                    },
                );
            }
        });
    }

    vBatLow(value: number) {
        return new Promise<void>((resolve, reject) => {
            if (this.offlineMode) {
                this.eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vBatLow: value,
                });
                resolve();
            } else {
                this.sendCommand(
                    `npm1012 charger voltage batlow set ${value}`,
                    () => resolve(),
                    () => {
                        this.get.vBatLow?.();
                        reject();
                    },
                );
            }
        });
    }
}
