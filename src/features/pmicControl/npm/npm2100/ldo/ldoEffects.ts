/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import { Ldo, LdoMode, PmicDialog } from '../../types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlPinSelect,
    nPM2100LdoModeControl,
    nPM2100LDOSoftStart,
    nPM2100LoadSwitchSoftStart,
} from '../types';

export const ldoGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    ldoVoltage: () => sendCommand(`npm2100 ldosw vout get`),
    ldoEnabled: () => sendCommand(`npm2100 ldosw enable get`),
    ldoMode: () => sendCommand(`npm2100 ldosw mode get`),
    ldoModeCtrl: () => sendCommand(`npm2100 ldosw modectrl get`),
    ldoPinSel: () => sendCommand(`npm2100 ldosw pinsel get`),
    ldoSoftStartLdo: () => sendCommand(`npm2100 ldosw softstart LDO get`),
    ldoSoftStartLoadSw: () => sendCommand(`npm2100 ldosw softstart LOADSW get`),
    ldoPinMode: () => sendCommand(`npm2100 ldosw pinmode get`),
    ldoOcp: () => sendCommand(`npm2100 ldosw ocp get`),
    ldoLdoRamp: () => sendCommand(`npm2100 ldosw ldoramp get`),
    ldoLdoHalt: () => sendCommand(`npm2100 ldosw ldohalt get`),
});

export const ldoSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    dialogHandler: ((dialog: PmicDialog) => void) | null,
    offlineMode: boolean
) => {
    const {
        ldoVoltage,
        ldoEnabled,
        ldoMode,
        ldoModeCtrl,
        ldoPinSel,
        ldoPinMode,
        ldoSoftStartLdo,
        ldoSoftStartLoadSw,
        ldoOcp,
        ldoLdoRamp,
        ldoLdoHalt,
    } = ldoGet(sendCommand);

    // Mode
    const setLdoMode = (index: number, mode: LdoMode) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        mode,
                        enabled: false,
                    },
                    index
                );
                resolve();
            } else {
                setLdoEnabled(index, false).then(() => {
                    sendCommand(
                        `npm2100 ldosw mode set ${mode}`,
                        () => resolve(),
                        () => {
                            ldoMode();
                            reject();
                        }
                    );
                });
            }
        });

    // Vout
    const setLdoVoltage = (index: number, voltage: number) =>
        new Promise<void>((resolve, reject) => {
            eventEmitter.emitPartialEvent<Ldo>(
                'onLdoUpdate',
                {
                    voltage,
                },
                index
            );

            if (offlineMode) {
                resolve();
            } else {
                setLdoMode(index, 'LDO') // Fixme: is this correct still?
                    .then(() => {
                        sendCommand(
                            `npm2100 ldosw vout set ${voltage * 1000}`,
                            () => resolve(),
                            () => {
                                ldoVoltage();
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        ldoVoltage();
                        reject();
                    });
            }
        });

    // Enable
    const setLdoEnabled = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        enabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw enable set ${enabled ? 'ON' : 'OFF'}`,
                    () => {
                        // ldoEnabled();
                        resolve();
                    },
                    () => {
                        ldoEnabled();
                        reject();
                    }
                );
            }
        });

    // LDO Softstart
    const setLdoSoftstart = (
        index: number,
        ldoSoftStart: nPM2100LDOSoftStart
    ) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ldoSoftStart,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw softstart LDO set ${ldoSoftStart}`,
                    () => resolve(),
                    () => {
                        ldoSoftStartLdo();
                        reject();
                    }
                );
            }
        });

    // LoadSwitch Softstart
    const setLoadSwitchSoftstart = (
        index: number,
        loadSwitchSoftStart: nPM2100LoadSwitchSoftStart
    ) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        loadSwitchSoftStart,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw softstart LOADSW set ${loadSwitchSoftStart}`,
                    () => resolve(),
                    () => {
                        ldoSoftStartLoadSw();
                        reject();
                    }
                );
            }
        });

    // Modectrl
    const setLdoModeControl = (
        index: number,
        modeControl: nPM2100LdoModeControl
    ) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        modeControl,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw modectrl set ${modeControl}`,
                    () => resolve(),
                    () => {
                        ldoModeCtrl();
                        reject();
                    }
                );
            }
        });

    // Pinsel
    const setLdoPinSel = (index: number, pinSel: nPM2100GPIOControlPinSelect) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        pinSel,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw pinsel set ${pinSel}`,
                    () => resolve(),
                    () => {
                        ldoPinSel();
                        reject();
                    }
                );
            }
        });

    // Pinmode
    const setLdoPinMode = (index: number, pinMode: nPM2100GPIOControlMode) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        pinMode,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw pinmode set ${pinMode}`,
                    () => resolve(),
                    () => {
                        ldoPinMode();
                        reject();
                    }
                );
            }
        });

    // OCP
    const setLdoOcpEnabled = (index: number, ocpEnabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ocpEnabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw ocp set ${ocpEnabled ? 'ON' : 'OFF'}`,
                    () => resolve(),
                    () => {
                        ldoOcp();
                        reject();
                    }
                );
            }
        });

    // LDORampEnabled
    const setLdoRampEnabled = (index: number, ldoRampEnabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ldoRampEnabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw ldoramp set ${
                        ldoRampEnabled ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        ldoLdoRamp();
                        reject();
                    }
                );
            }
        });

    // LDOHaltEnabled
    const setLdoHaltEnabled = (index: number, ldoHaltEnabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        ldoHaltEnabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npm2100 ldosw ldohalt set ${
                        ldoHaltEnabled ? 'ON' : 'OFF'
                    }`,
                    () => resolve(),
                    () => {
                        ldoLdoHalt();
                        reject();
                    }
                );
            }
        });

    return {
        setLdoVoltage,
        setLdoEnabled,
        setLdoMode,
        setLdoModeControl,
        setLdoPinSel,
        setLdoSoftstart,
        setLoadSwitchSoftstart,
        setLdoPinMode,
        setLdoOcpEnabled,
        setLdoRampEnabled,
        setLdoHaltEnabled,
    };
};
