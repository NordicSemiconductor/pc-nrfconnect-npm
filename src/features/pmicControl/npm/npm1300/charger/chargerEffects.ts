/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { Charger, ITerm, NTCThermistor, VTrickleFast } from '../../types';

export const chargerGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    pmicChargingState: () => sendCommand('npmx charger status get'),

    chargerVTerm: () =>
        sendCommand('npmx charger termination_voltage normal get'),
    chargerIChg: () => sendCommand('npmx charger charger_current get'),
    chargerEnabled: () => sendCommand('npmx charger module charger get'),
    chargerVTrickleFast: () => sendCommand('npmx charger trickle get'),
    chargerITerm: () => sendCommand('npmx charger termination_current get'),
    chargerBatLim: () => sendCommand('npmx charger discharging_current get'),
    chargerEnabledRecharging: () =>
        sendCommand('npmx charger module recharge get'),
    chargerNTCThermistor: () => sendCommand('npmx adc ntc type get'),
    chargerNTCBeta: () => sendCommand('npmx adc ntc beta get'),
    chargerTChgStop: () => sendCommand('npmx charger die_temp stop get'),
    chargerTChgResume: () => sendCommand('npmx charger die_temp resume get'),
    chargerVTermR: () =>
        sendCommand('npmx charger termination_voltage warm get'),
    chargerTCold: () => sendCommand('npmx charger ntc_temperature cold get'),
    chargerTCool: () => sendCommand('npmx charger ntc_temperature cool get'),
    chargerTWarm: () => sendCommand('npmx charger ntc_temperature warm get'),
    chargerTHot: () => sendCommand('npmx charger ntc_temperature hot get'),
});

export const chargerSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => {
    const {
        chargerVTerm,
        chargerIChg,
        chargerEnabled,
        chargerVTrickleFast,
        chargerITerm,
        chargerEnabledRecharging,
        chargerNTCThermistor,
        chargerNTCBeta,
        chargerTChgStop,
        chargerTChgResume,
        chargerVTermR,
        chargerTCold,
        chargerTCool,
        chargerTWarm,
        chargerTHot,
    } = chargerGet(sendCommand);

    const setChargerVTerm = (value: number) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                vTerm: value,
            });

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_voltage normal set ${
                                value * 1000
                            }`, // mv to V
                            () => resolve(),
                            () => {
                                chargerVTerm();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        chargerVTerm();
                        reject();
                    });
            }
        });

    const setChargerIChg = (value: number) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iChg: value,
            });

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() =>
                        sendCommand(
                            `npmx charger charger_current set ${value}`,
                            () => resolve(),
                            () => {
                                chargerIChg();
                                reject();
                            }
                        )
                    )
                    .catch(() => {
                        chargerIChg();
                        reject();
                    });
            }
        });

    const setChargerVTrickleFast = (value: VTrickleFast) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                vTrickleFast: value,
            });

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger trickle set ${value * 1000}`,
                            () => resolve(),
                            () => {
                                chargerVTrickleFast();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        chargerVTrickleFast();
                        reject();
                    });
            }
        });

    const setChargerITerm = (iTerm: ITerm) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                iTerm,
            });

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx charger termination_current set ${Number.parseInt(
                                iTerm,
                                10
                            )}`,
                            () => resolve(),
                            () => {
                                chargerITerm();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        chargerITerm();
                        reject();
                    });
            }
        });

    const setChargerEnabledRecharging = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enableRecharging: enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        chargerEnabledRecharging();
                        reject();
                    }
                );
            }
        });
    const setChargerNTCThermistor = (
        mode: NTCThermistor,
        autoSetBeta?: boolean
    ) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
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
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    ntcBeta,
                });
            }

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() => {
                        sendCommand(
                            `npmx adc ntc type set ${value}`,
                            () => {
                                if (autoSetBeta && mode !== 'Ignore NTC') {
                                    setChargerNTCBeta(ntcBeta)
                                        .then(resolve)
                                        .catch(reject);
                                } else {
                                    resolve();
                                }
                            },
                            () => {
                                chargerNTCThermistor();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        chargerNTCThermistor();
                        reject();
                    });
            }
        });

    const setChargerNTCBeta = (ntcBeta: number) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                ntcBeta,
            });

            if (offlineMode) {
                resolve();
            } else {
                setChargerEnabled(false)
                    .then(() =>
                        sendCommand(
                            `npmx adc ntc beta set ${ntcBeta}`,
                            () => {
                                resolve();
                            },
                            () => {
                                chargerNTCBeta();
                                reject();
                            }
                        )
                    )
                    .catch(reject);
            }
        });

    const setChargerEnabled = (enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    enabled,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    () => {
                        resolve();
                    },
                    () => {
                        chargerEnabled();
                        reject();
                    }
                );
            }
        });

    const setChargerTChgStop = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgStop: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger die_temp stop set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTChgStop();
                        reject();
                    }
                );
            }
        });

    const setChargerTChgResume = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tChgResume: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger die_temp resume set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTChgResume();
                        reject();
                    }
                );
            }
        });

    const setChargerVTermR = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    vTermR: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger termination_voltage warm set ${value * 1000}`,
                    () => resolve(),
                    () => {
                        chargerVTermR();
                        reject();
                    }
                );
            }
        });

    const setChargerTCold = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCold: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature cold set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTCold();
                        reject();
                    }
                );
            }
        });

    const setChargerTCool = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tCool: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature cool set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTCool();
                        reject();
                    }
                );
            }
        });

    const setChargerTWarm = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tWarm: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature warm set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTWarm();
                        reject();
                    }
                );
            }
        });

    const setChargerTHot = (value: number) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Charger>('onChargerUpdate', {
                    tHot: value,
                });
                resolve();
            } else {
                sendCommand(
                    `npmx charger ntc_temperature hot set ${value}`,
                    () => resolve(),
                    () => {
                        chargerTHot();
                        reject();
                    }
                );
            }
        });

    return {
        setChargerVTerm,
        setChargerIChg,
        setChargerEnabled,
        setChargerVTrickleFast,
        setChargerITerm,
        setChargerEnabledRecharging,
        setChargerNTCThermistor,
        setChargerNTCBeta,
        setChargerTChgStop,
        setChargerTChgResume,
        setChargerVTermR,
        setChargerTCold,
        setChargerTCool,
        setChargerTWarm,
        setChargerTHot,
    };
};
