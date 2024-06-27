/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Ldo, LdoExport } from '../../types';
import ldoCallbacks from './ldoCallbacks';
import { LdoGet } from './ldoGet';
import { LdoSet } from './ldoSet';

export const numberOfLdos = 1;
const ldoDefaults = (): Ldo => ({
    voltage: getLdoVoltageRange().min,
    mode: 'load_switch',
    enabled: false,
    softStartEnabled: true,
    softStart: 20,
    activeDischarge: false,
    onOffControl: 'SW',
    onOffSoftwareControlEnabled: true,
});

export const toLdoExport = (ldo: Ldo): LdoExport => ({
    voltage: ldo.voltage,
    enabled: ldo.enabled,
    mode: ldo.mode,
    softStartEnabled: ldo.softStartEnabled,
    softStart: ldo.softStart,
    activeDischarge: ldo.activeDischarge,
    onOffControl: ldo.onOffControl,
});

const getLdoVoltageRange = () =>
    ({
        min: 0.8,
        max: 3,
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
    offlineMode: boolean
) => [
    {
        index: 0,
        get: new LdoGet(sendCommand),
        set: new LdoSet(eventEmitter, sendCommand, offlineMode),
        callbacks: ldoCallbacks(shellParser, eventEmitter),
        ranges: {
            voltage: getLdoVoltageRange(),
        },
        defaults: ldoDefaults(),
    },
];
