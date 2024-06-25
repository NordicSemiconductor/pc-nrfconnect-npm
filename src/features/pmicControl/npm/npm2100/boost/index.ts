/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Boost, PmicDialog } from '../../types';
import boostCallbacks from './boostCallback';
import { BoostGet } from './boostGet';
import { BoostSet } from './boostSet';

export const numberOfBoosts = 1;

const boostDefaults = (): Boost => ({
    vOut: voltageRange().min,
    mode: 'VSET',
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
    dialogHandler: ((dialog: PmicDialog) => void) | null,
    offlineMode: boolean
) => [
    {
        get: new BoostGet(sendCommand),
        set: new BoostSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode
        ),
        callbacks: boostCallbacks(shellParser, eventEmitter),
        ranges: {
            voltageRange: voltageRange(),
        },
        defaults: boostDefaults(),
    },
];
