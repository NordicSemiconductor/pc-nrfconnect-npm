/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    noop,
    NpmEventEmitter,
    parseBatteryModel,
    parseColonBasedAnswer,
    parseLogData,
    parseToBoolean,
    toRegex,
} from '../../pmicHelpers';
import {
    BatteryModel,
    BatteryModelCharacterization,
    FuelGauge,
    ProfileDownload,
} from '../../types';
import type FuelGaugeModule from '.';
import { FuelGaugeGet } from './fuelGaugeGet';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    get: FuelGaugeGet,
    fuelGaugeModule: FuelGaugeModule
) => {
    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge', true, undefined, '(1|0)'),

                res => {
                    eventEmitter.emit('onFuelGauge', {
                        enabled: parseToBoolean(res),
                    } satisfies Partial<FuelGauge>);
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model download begin'),
                () => shellParser?.setShellEchos(false),
                () => shellParser?.setShellEchos(true)
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'fuel_gauge params runtime discard_positive_deltaz',
                    true,
                    undefined,
                    '(1|0)'
                ),
                res => {
                    eventEmitter.emit('onFuelGauge', {
                        discardPosiiveDeltaZ: parseToBoolean(res),
                    } satisfies Partial<FuelGauge>);
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex(
                    'fuel_gauge model',
                    true,
                    undefined,
                    '"[A-Za-z0-9_\\s]+"'
                ),
                res => {
                    eventEmitter.emit(
                        'onActiveBatteryModelUpdate',
                        parseNpm2100BatteryModel(parseColonBasedAnswer(res))
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model store'),
                () => {
                    get.storedBatteryModel();
                    get.activeBatteryModel();
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model list'),
                res => {
                    const models = res.split(
                        'Battery models stored in database:'
                    );
                    if (models.length < 2) {
                        eventEmitter.emit('onStoredBatteryModelUpdate', []);
                        return;
                    }
                    const stringModels = models[1].trim().split('\n');
                    const list = stringModels.map(parseBatteryModel);
                    eventEmitter.emit(
                        'onStoredBatteryModelUpdate',
                        list.filter(item => item != null)
                    );
                },
                noop
            )
        );

        // profile download
        cleanupCallbacks.push(
            shellParser.onShellLoggingEvent(logEvent => {
                parseLogData(logEvent, loggingEvent => {
                    if (loggingEvent.module === 'module_fg') {
                        if (loggingEvent.message === 'Battery model timeout') {
                            shellParser?.setShellEchos(true);

                            fuelGaugeModule.profileDownloadAborting = true;
                            if (fuelGaugeModule.profileDownloadInProgress) {
                                fuelGaugeModule.profileDownloadInProgress =
                                    false;

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
                    if (fuelGaugeModule.profileDownloadInProgress) {
                        fuelGaugeModule.profileDownloadInProgress = false;
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
                    if (fuelGaugeModule.profileDownloadInProgress) {
                        fuelGaugeModule.profileDownloadInProgress = false;
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
                    if (fuelGaugeModule.profileDownloadInProgress) {
                        fuelGaugeModule.profileDownloadInProgress = false;
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
                    if (fuelGaugeModule.profileDownloadInProgress) {
                        fuelGaugeModule.profileDownloadInProgress = false;
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

// Battery Type response: name="Generic_AA",Q={2000.00 mAh}
function parseNpm2100BatteryModel(message: string): BatteryModel | undefined {
    const batteryMessagePattern = /^name="([^"]+)",Q={([^}]+)}$/;

    const matches = batteryMessagePattern.exec(message);

    const name = matches?.[1] as string;
    const capacity = Number.parseFloat(matches?.[2] as string);

    if (name || capacity) {
        return {
            name,
            batteryClass: 'Primary',
            characterizations: [{ capacity } as BatteryModelCharacterization],
        } as BatteryModel;
    }

    return undefined;
}
