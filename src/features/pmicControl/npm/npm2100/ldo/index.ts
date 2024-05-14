/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Ldo, LdoExport, PmicDialog } from '../../types';
import ldoCallbacks from './ldoCallbacks';
import { ldoGet, ldoSet } from './ldoEffects';

export const ldoDefaults = (noOfLdos: number): Ldo[] => {
    const defaultLDOs: Ldo[] = [];
    for (let i = 0; i < noOfLdos; i += 1) {
        defaultLDOs.push({
            voltage: getLdoVoltageRange(i).min,
            mode: 'ldoSwitch',
            enabled: false,
            softStartEnabled: true,
            softStart: 20,
            activeDischarge: false,
            onOffControl: 'SW',
            onOffSoftwareControlEnabled: true,
        });
    }
    return defaultLDOs;
};

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    softStartEnabled: ldo.softStartEnabled,
    softStart: ldo.softStart,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getLdoVoltageRange = (i: number) =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
        step: 0.1,
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
    offlineMode: boolean,
    noOfBucks: number
) => ({
    ldoGet: ldoGet(sendCommand),
    ldoSet: ldoSet(eventEmitter, sendCommand, dialogHandler, offlineMode),
    ldoCallbacks: ldoCallbacks(shellParser, eventEmitter, noOfBucks),
    ldoRanges: {
        getLdoVoltageRange,
    },
});
