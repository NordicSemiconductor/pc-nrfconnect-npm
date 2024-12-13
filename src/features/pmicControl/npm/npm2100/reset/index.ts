/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { ResetModule } from '../../types';
import {
    npm2100LongPressResetDebounceValues,
    npm2100ResetPinSelection,
} from '../types';
import resetCallbacks from './resetCallbacks';
import { ResetGet } from './resetGetters';
import { ResetSet } from './resetSetters';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): ResetModule => ({
    get: new ResetGet(sendCommand),
    set: new ResetSet(eventEmitter, sendCommand, offlineMode),
    values: {
        pinSelection: Object.keys(npm2100ResetPinSelection).map(key => ({
            label: `${key}`,
            value: npm2100ResetPinSelection[
                key as keyof typeof npm2100ResetPinSelection
            ],
        })),
        longPressResetDebounce: npm2100LongPressResetDebounceValues.map(
            item => ({
                label: `${item}`,
                value: `${item}`,
            })
        ),
        longPressReset: [],
    },
    callbacks: resetCallbacks(shellParser, eventEmitter),
    defaults: {
        longPressResetEnable: false,
        longPressResetDebounce: '5s',
        resetPinSelection: npm2100ResetPinSelection['PG/RESET'],
    },
});

// Mapping from reset reason code to description
export const ResetReasons = new Map<string, string>([
    ['Unknown', 'Unknown reason'],
    ['ColdPwrUp', 'Cold power up'],
    ['TSD', 'Thermal shutdown'],
    ['BootMonit', 'Boot monitor'],
    ['Button', 'Long press reset button'],
    ['WdRst', 'Watchdog reset'],
    ['WdPwrCycle', 'Watchdog power cycle'],
    ['SwReset', 'Software reset task'],
    ['HiberPin', 'SHPHLD pin exit from HIBERNATE mode'],
    ['HiberTimer', 'Timer exit from HIBERNATE mode'],
    ['HiberPtPin', 'SHPHLD pin exit from HIBERNATE_PT mode'],
    ['HiberPtTimer', 'Timer exit from HIBERNATE_PT mode'],
    ['PowerOffButton', 'PowerOffButton'],
    ['ShipExit', 'Exit from SHIP mode'],
    ['OCP', 'Over-current protection (OCP)'],
]);
