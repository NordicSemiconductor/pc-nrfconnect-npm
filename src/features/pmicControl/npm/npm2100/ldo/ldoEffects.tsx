/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    GPIOValues,
    Ldo,
    LdoMode,
    LdoOnOffControl,
    LdoOnOffControlValues,
    PmicDialog,
    SoftStart,
} from '../../types';

export const ldoGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    ldoVoltage: (index: number) =>
        sendCommand(`npmx ldsw ldo_voltage get ${index}`),
    ldoEnabled: (index: number) => sendCommand(`npmx ldsw status get ${index}`),
    ldoMode: (index: number) => sendCommand(`npmx ldsw mode get ${index}`),
    ldoSoftStartEnabled: (index: number) =>
        sendCommand(`npmx ldsw soft_start enable get ${index}`),
    ldoSoftStart: (index: number) =>
        sendCommand(`npmx ldsw soft_start current get ${index}`),
    ldoActiveDischarge: (index: number) =>
        sendCommand(`npmx ldsw active_discharge get ${index}`),
    ldoOnOffControl: (index: number) =>
        sendCommand(`npmx ldsw gpio index get ${index}`),
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
        ldoSoftStartEnabled,
        ldoSoftStart,
        ldoActiveDischarge,
        ldoOnOffControl,
    } = ldoGet(sendCommand);

    const setLdoMode = (index: number, mode: LdoMode) => {
        const action = () =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Ldo>(
                        'onLdoUpdate',
                        {
                            mode,
                        },
                        index
                    );
                    resolve();
                } else {
                    sendCommand(
                        `npmx ldsw mode set ${index} ${
                            mode === 'ldoSwitch' ? '0' : '1'
                        }`,
                        () => resolve(),
                        () => {
                            ldoMode(index);
                            reject();
                        }
                    );
                }
            });

        if (dialogHandler && !offlineMode && mode === 'LDO') {
            const ldo1Message = (
                <span>
                    Before enabling LDO1, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO1
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT1</span>{' '}
                            - LS
                            <span className="subscript">IN1</span>.
                        </li>
                        <li>
                            Disconnect HIGH - LS
                            <span className="subscript">OUT1</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN1, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            const ldo2Message = (
                <span>
                    Before enabling LDO2, configure the EK as follows:
                    <ul>
                        <li>
                            Connect LDO bypass capacitors by connecting the LDO2
                            jumper on P16.
                        </li>
                        <li>
                            Disconnect V<span className="subscript">OUT2</span>{' '}
                            - LS
                            <span className="subscript">IN2</span>.
                        </li>
                        <li>
                            Disconnect LOW - LS
                            <span className="subscript">OUT2</span> jumpers on
                            P15.
                        </li>
                        <li>
                            Ensure IN2, on P8, is connected to a source that is
                            between 2.6 V and 5.5 V, for example V
                            <span className="subscript">SYS</span>.
                        </li>
                    </ul>
                </span>
            );
            return new Promise<void>((resolve, reject) => {
                const warningDialog: PmicDialog = {
                    type: 'alert',
                    doNotAskAgainStoreID: `pmic2100-setLdoMode-${index}`,
                    message: index === 0 ? ldo1Message : ldo2Message,
                    confirmLabel: 'OK',
                    optionalLabel: "OK, don't ask again",
                    cancelLabel: 'Cancel',
                    title: 'Warning',
                    onConfirm: () => action().then(resolve).catch(reject),
                    onCancel: reject,
                    onOptional: () => action().then(resolve).catch(reject),
                };

                dialogHandler(warningDialog);
            });
        }

        return action();
    };

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
                setLdoMode(index, 'LDO')
                    .then(() => {
                        sendCommand(
                            `npmx ldsw ldo_voltage set ${index} ${
                                voltage * 1000
                            }`,
                            () => resolve(),
                            () => {
                                ldoVoltage(index);
                                reject();
                            }
                        );
                    })
                    .catch(() => {
                        ldoVoltage(index);
                        reject();
                    });
            }
        });

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
                    `npmx ldsw status set ${index} ${enabled ? '1' : '0'}`,
                    () => resolve(),
                    () => {
                        ldoEnabled(index);
                        reject();
                    }
                );
            }
        });

    const setLdoSoftStartEnabled = (index: number, enabled: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStartEnabled: enabled,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw soft_start enable set ${index} ${
                        enabled ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        ldoSoftStartEnabled(index);
                        reject();
                    }
                );
            }
        });

    const setLdoSoftStart = (index: number, softStart: SoftStart) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        softStart,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw soft_start current set ${index} ${softStart}`,
                    () => resolve(),
                    () => {
                        ldoSoftStart(index);
                        reject();
                    }
                );
            }
        });

    const setLdoActiveDischarge = (index: number, activeDischarge: boolean) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        activeDischarge,
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw active_discharge set ${index} ${
                        activeDischarge ? '1' : '0'
                    }`,
                    () => resolve(),
                    () => {
                        ldoActiveDischarge(index);
                        reject();
                    }
                );
            }
        });

    const setLdoOnOffControl = (index: number, onOffControl: LdoOnOffControl) =>
        new Promise<void>((resolve, reject) => {
            if (offlineMode) {
                eventEmitter.emitPartialEvent<Ldo>(
                    'onLdoUpdate',
                    {
                        onOffControl,
                        onOffSoftwareControlEnabled:
                            onOffControl === LdoOnOffControlValues[0],
                    },
                    index
                );
                resolve();
            } else {
                sendCommand(
                    `npmx ldsw gpio index set ${index} ${GPIOValues.findIndex(
                        v => v === onOffControl
                    )}`,
                    () => resolve(),
                    () => {
                        ldoOnOffControl(index);
                        reject();
                    }
                );
            }
        });

    return {
        setLdoMode,
        setLdoVoltage,
        setLdoEnabled,
        setLdoSoftStartEnabled,
        setLdoSoftStart,
        setLdoActiveDischarge,
        setLdoOnOffControl,
    };
};
