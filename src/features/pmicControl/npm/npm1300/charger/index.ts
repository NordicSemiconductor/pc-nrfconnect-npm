/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import chargerCallbacks from './chargerCallbacks';
import { chargerGet, chargerSet } from './chargerEffects';

const chargerRanges = () => ({
    getChargerVoltageRange: () =>
        getRange([
            {
                min: 3.5,
                max: 3.65,
                step: 0.05,
            },
            {
                min: 4.0,
                max: 4.45,
                step: 0.05,
            },
        ]).map(v => Number(v.toFixed(2))),
    getChargerVTermRRange: () =>
        getRange([
            {
                min: 3.5,
                max: 3.65,
                step: 0.05,
            },
            {
                min: 4.0,
                max: 4.45,
                step: 0.05,
            },
        ]).map(v => Number(v.toFixed(2))),
    getChargerJeitaRange: () => ({
        min: -20,
        max: 60,
    }),
    getChargerChipThermalRange: () => ({
        min: 50,
        max: 110,
    }),
    getChargerCurrentRange: () => ({
        min: 32,
        max: 800,
        decimals: 0,
        step: 2,
    }),
    getChargerNTCBetaRange: () => ({
        min: 0,
        max: 4294967295,
        decimals: 0,
        step: 1,
    }),
});

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
) => ({
    chargerGet: chargerGet(sendCommand),
    chargerSet: chargerSet(eventEmitter, sendCommand, offlineMode),
    chargerCallbacks: chargerCallbacks(shellParser, eventEmitter),
    chargerRanges: chargerRanges(),
});
