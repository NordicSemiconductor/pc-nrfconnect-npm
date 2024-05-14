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
    parseToBoolean,
    toRegex,
} from '../../pmicHelpers';
import { fuelGaugeGet } from './fuelGaugeEffects';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void
) => {
    const { storedBatteryModel, activeBatteryModel } =
        fuelGaugeGet(sendCommand);

    const cleanupCallbacks = [];

    if (shellParser) {
        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge', true, undefined, '(1|0)'),

                res => {
                    eventEmitter.emit('onFuelGauge', parseToBoolean(res));
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
                    'fuel_gauge model',
                    true,
                    undefined,
                    '"[A-Za-z0-9\\s]+"'
                ),
                res => {
                    eventEmitter.emit(
                        'onActiveBatteryModelUpdate',
                        parseBatteryModel(parseColonBasedAnswer(res))
                    );
                },
                noop
            )
        );

        cleanupCallbacks.push(
            shellParser.registerCommandCallback(
                toRegex('fuel_gauge model store'),
                () => {
                    storedBatteryModel();
                    activeBatteryModel();
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
    }

    return cleanupCallbacks;
};
