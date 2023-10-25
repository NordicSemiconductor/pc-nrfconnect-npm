/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';
import {
    Buck,
    BuckMode,
    BuckModeControl,
    BuckOnOffControl,
    BuckRetentionControl,
    GPIOValues,
    PmicDialog,
} from '../../types';

export const buckGet = (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => ({
    buckVOutNormal: (index: number) =>
        sendCommand(`npmx buck voltage normal get ${index}`),
    buckVOutRetention: (index: number) =>
        sendCommand(`npmx buck voltage retention get ${index}`),
    buckMode: (index: number) =>
        sendCommand(`npmx buck vout select get ${index}`),
    buckModeControl: (index: number) =>
        sendCommand(`npmx buck gpio pwm_force get ${index}`),
    buckOnOffControl: (index: number) =>
        sendCommand(`npmx buck gpio on_off get ${index}`),
    buckRetentionControl: (index: number) =>
        sendCommand(`npmx buck gpio retention get ${index}`),
    buckEnabled: (index: number) =>
        sendCommand(`npmx buck status power get ${index}`),
    buckActiveDischarge: (index: number) =>
        sendCommand(`npmx buck active_discharge get ${index}`),
});

export const buckSet = (
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
        buckVOutNormal,
        buckVOutRetention,
        buckMode,
        buckModeControl,
        buckOnOffControl,
        buckRetentionControl,
        buckEnabled,
        buckActiveDischarge,
    } = buckGet(sendCommand);

    return {
        setBuckVOutNormal: (index: number, value: number) => {
            const action = () =>
                new Promise<void>((resolve, reject) => {
                    if (offlineMode) {
                        eventEmitter.emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                vOutNormal: value,
                            },
                            index
                        );

                        eventEmitter.emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                mode: 'software',
                            },
                            index
                        );

                        resolve();
                    } else {
                        sendCommand(
                            `npmx buck voltage normal set ${index} ${
                                value * 1000
                            }`,
                            () =>
                                sendCommand(
                                    `npmx buck vout select set ${index} 1`,
                                    () => resolve(),
                                    () => {
                                        buckMode(index);
                                        reject();
                                    }
                                ),
                            () => {
                                buckVOutNormal(index);
                                reject();
                            }
                        );
                    }
                });

            if (dialogHandler && !offlineMode && index === 1 && value <= 1.6) {
                return new Promise<void>((resolve, reject) => {
                    const warningDialog: PmicDialog = {
                        type: 'alert',
                        doNotAskAgainStoreID: 'pmic1300-setBuckVOut-1',
                        message: `Buck 2 powers the I2C communication required by this app. A voltage lower than 1.6 V might cause issues with the app connection.
                    Are you sure you want to continue?`,
                        confirmLabel: 'Yes',
                        optionalLabel: "Yes, don't ask again",
                        cancelLabel: 'No',
                        title: 'Warning',
                        onConfirm: () => action().then(resolve).catch(reject),
                        onCancel: () => {
                            buckVOutNormal(index);
                            reject();
                        },
                        onOptional: () => action().then(resolve).catch(reject),
                    };

                    dialogHandler(warningDialog);
                });
            }

            return action();
        },

        setBuckVOutRetention: (index: number, value: number) =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            vOutRetention: value,
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck voltage retention set ${index} ${
                            value * 1000
                        }`,
                        () => resolve(),
                        () => {
                            buckVOutRetention(index);
                            reject();
                        }
                    );
                }
            }),

        setBuckMode: (index: number, mode: BuckMode) => {
            const action = () =>
                new Promise<void>((resolve, reject) => {
                    if (offlineMode) {
                        eventEmitter.emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                mode,
                            },
                            index
                        );
                        resolve();
                    } else {
                        sendCommand(
                            `npmx buck vout select set ${index} ${
                                mode === 'software' ? 1 : 0
                            }`,
                            () => {
                                buckVOutNormal(index);
                                resolve();
                            },
                            () => {
                                buckMode(index);
                                reject();
                            }
                        );
                    }
                });

            // TODO Check software voltage as well
            if (
                dialogHandler &&
                !offlineMode &&
                index === 1 &&
                mode === 'software'
            ) {
                return new Promise<void>((resolve, reject) => {
                    const warningDialog: PmicDialog = {
                        type: 'alert',
                        doNotAskAgainStoreID: 'pmic1300-setBuckVOut-0',
                        message: `Buck 2 powers the I2C communication required by this app. A software voltage might be already set to less then 1.6 V . Are you sure you want to continue?`,
                        confirmLabel: 'Yes',
                        optionalLabel: "Yes, don't ask again",
                        cancelLabel: 'No',
                        title: 'Warning',
                        onConfirm: () => action().then(resolve).catch(reject),
                        onCancel: reject,
                        onOptional: () => action().then(resolve).catch(reject),
                    };

                    dialogHandler(warningDialog);
                });
            }

            return action();
        },

        setBuckModeControl: (index: number, modeControl: BuckModeControl) =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            modeControl,
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck gpio pwm_force set ${index} ${GPIOValues.findIndex(
                            v => v === modeControl
                        )} 0`,
                        () => resolve(),
                        () => {
                            buckModeControl(index);
                            reject();
                        }
                    );
                }
            }),

        setBuckOnOffControl: (index: number, onOffControl: BuckOnOffControl) =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            onOffControl,
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck gpio on_off set ${index} ${GPIOValues.findIndex(
                            v => v === onOffControl
                        )} 0`,
                        () => resolve(),
                        () => {
                            buckOnOffControl(index);
                            reject();
                        }
                    );
                }
            }),

        setBuckRetentionControl: (
            index: number,
            retentionControl: BuckRetentionControl
        ) =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            retentionControl,
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck gpio retention set ${index} ${GPIOValues.findIndex(
                            v => v === retentionControl
                        )} 0`,
                        () => resolve(),
                        () => {
                            buckRetentionControl(index);
                            reject();
                        }
                    );
                }
            }),

        setBuckEnabled: (index: number, enabled: boolean) => {
            const action = () =>
                new Promise<void>((resolve, reject) => {
                    if (offlineMode) {
                        eventEmitter.emitPartialEvent<Buck>(
                            'onBuckUpdate',
                            {
                                enabled,
                            },
                            index
                        );
                        resolve();
                    } else {
                        sendCommand(
                            `npmx buck status power set ${index} ${
                                enabled ? '1' : '0'
                            }`,
                            () => resolve(),
                            () => {
                                buckEnabled(index);
                                reject();
                            }
                        );
                    }
                });

            if (dialogHandler && !offlineMode && index === 1 && !enabled) {
                return new Promise<void>((resolve, reject) => {
                    const warningDialog: PmicDialog = {
                        type: 'alert',
                        doNotAskAgainStoreID: 'pmic1300-setBuckEnabled-1',
                        message: `Disabling the buck 2 might effect I2C communications to the PMIC chip and hance you might get
                disconnected from the app. Are you sure you want to continue?`,
                        confirmLabel: 'Yes',
                        optionalLabel: "Yes, don't ask again",
                        cancelLabel: 'No',
                        title: 'Warning',
                        onConfirm: () => action().then(resolve).catch(reject),
                        onCancel: reject,
                        onOptional: () => action().then(resolve).catch(reject),
                    };

                    dialogHandler(warningDialog);
                });
            }

            return action();
        },

        setBuckActiveDischarge: (
            index: number,
            activeDischargeEnabled: boolean
        ) =>
            new Promise<void>((resolve, reject) => {
                if (offlineMode) {
                    eventEmitter.emitPartialEvent<Buck>(
                        'onBuckUpdate',
                        {
                            activeDischarge: activeDischargeEnabled,
                        },
                        index
                    );

                    resolve();
                } else {
                    sendCommand(
                        `npmx buck active_discharge set ${index} ${
                            activeDischargeEnabled ? '1' : '0'
                        }`,
                        () => resolve(),
                        () => {
                            buckActiveDischarge(index);
                            reject();
                        }
                    );
                }
            }),
    };
};
