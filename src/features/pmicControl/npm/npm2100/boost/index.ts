/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Boost, BoostModule } from '../../types';
import boostCallbacks from './callbacks';
import { BoostGet } from './getters';
import { BoostSet } from './setters';

export const numberOfBoosts = 1;

const boostDefaults = (): Boost => ({
    vOutSoftware: voltageRange().min,
    vOutVSet: voltageRange().min,
    vOutSelect: 'Vset',
    modeControl: 'AUTO',
    pinSelection: 'OFF',
    pinMode: 'HP',
    pinModeEnabled: false,
    overCurrentProtection: false,
});

const voltageRange = () =>
    ({
        min: 1.8,
        max: 3.3,
        decimals: 1,
    } as RangeType);

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): BoostModule[] => [
    {
        get: new BoostGet(sendCommand),
        set: new BoostSet(eventEmitter, sendCommand, offlineMode),
        callbacks: boostCallbacks(shellParser, eventEmitter),
        ranges: {
            voltage: voltageRange(),
        },
        defaults: boostDefaults(),
    },
];
