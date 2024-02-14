/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    NpmEventEmitter,
    parseColonBasedAnswer,
    parseLogData,
    toRegex,
} from '../../pmicHelpers';
import { ProfileDownload } from '../../types';
import { fuelGaugeGet } from './fuelGaugeEffects';

let profileDownloadInProgress = false;
let profileDownloadAborting = false;

export const profileDownloadCallbacks = (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter
) => {
    const cleanupCallbacks = [];

    // Reset when new npm device is created
    profileDownloadInProgress = false;
    profileDownloadAborting = false;

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.onShellLoggingEvent(logEvent => {
                parseLogData(logEvent, loggingEvent => {
                    if (loggingEvent.module === 'module_fg') {
                        if (loggingEvent.message === 'Battery model timeout') {
                            shellParser?.setShellEchos(true);

                            profileDownloadAborting = true;
                            if (profileDownloadInProgress) {
                                profileDownloadInProgress = false;
                                const payload: ProfileDownload = {
                                    state: 'aborted',
                                    alertMessage: loggingEvent.message,
                                };

                                eventEmitter.emit(
                                    'onProfileDownloadUpdate',
                                    payload
                                );
                            }
                        }
                    }
                });
            })
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download apply'),
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'applied',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }
                    shellParser?.setShellEchos(true);
                },
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'failed',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }
                    shellParser?.setShellEchos(true);
                }
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download abort'),
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'aborted',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }

                    shellParser?.setShellEchos(true);
                },
                res => {
                    if (profileDownloadInProgress) {
                        profileDownloadInProgress = false;
                        const profileDownload: ProfileDownload = {
                            state: 'failed',
                            alertMessage: parseColonBasedAnswer(res),
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );
                    }

                    shellParser?.setShellEchos(true);
                }
            )
        );
    }

    return cleanupCallbacks;
};

export const profileDownloadSet = (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void,
        unique?: boolean
    ) => void
) => {
    const { activeBatteryModel, storedBatteryModel } =
        fuelGaugeGet(sendCommand);

    const abortDownloadFuelGaugeProfile = () =>
        new Promise<void>((resolve, reject) => {
            const profileDownload: ProfileDownload = {
                state: 'aborting',
            };
            eventEmitter.emit('onProfileDownloadUpdate', profileDownload);

            profileDownloadAborting = true;
            sendCommand(
                `fuel_gauge model download abort`,
                () => {
                    resolve();
                },
                () => {
                    reject();
                }
            );
        });

    const applyDownloadFuelGaugeProfile = (slot = 0) =>
        new Promise<void>((resolve, reject) => {
            sendCommand(
                `fuel_gauge model download apply ${slot}`,
                () => {
                    resolve();
                },
                () => reject()
            );
        });

    const downloadFuelGaugeProfile = (profile: Buffer, slot?: number) => {
        const chunkSize = 256;
        const chunks = Math.ceil(profile.byteLength / chunkSize);

        return new Promise<void>((resolve, reject) => {
            const downloadData = (chunk = 0) => {
                sendCommand(
                    `fuel_gauge model download "${profile
                        .subarray(chunk * chunkSize, (chunk + 1) * chunkSize)
                        .toString()
                        .replaceAll('"', '\\"')}"`,
                    () => {
                        const profileDownload: ProfileDownload = {
                            state: 'downloading',
                            completeChunks: chunk + 1,
                            totalChunks: Math.ceil(
                                profile.byteLength / chunkSize
                            ),
                            slot,
                        };
                        eventEmitter.emit(
                            'onProfileDownloadUpdate',
                            profileDownload
                        );

                        if (
                            profileDownloadInProgress &&
                            !profileDownloadAborting &&
                            chunk + 1 !== chunks
                        ) {
                            downloadData(chunk + 1);
                        } else {
                            resolve();
                            storedBatteryModel();
                            activeBatteryModel();
                        }
                    },
                    res => {
                        () => {
                            if (profileDownloadInProgress) {
                                profileDownloadInProgress = false;
                                profileDownloadAborting = false;
                                const profileDownload: ProfileDownload = {
                                    state: 'failed',
                                    alertMessage: parseColonBasedAnswer('res'),
                                    slot,
                                };
                                eventEmitter.emit(
                                    'onProfileDownloadUpdate',
                                    profileDownload
                                );
                            }
                            reject(res);
                        };
                    },
                    false
                );
            };

            profileDownloadInProgress = true;
            profileDownloadAborting = false;
            sendCommand(
                'fuel_gauge model download begin',
                () => downloadData(),
                () => reject()
            );
        });
    };

    return {
        abortDownloadFuelGaugeProfile,
        applyDownloadFuelGaugeProfile,
        downloadFuelGaugeProfile,
    };
};
