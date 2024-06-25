/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RangeType } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { Buck, BuckExport, PmicDialog } from '../../types';
import buckCallbacks from './buckCallbacks';
import { BuckGet } from './buckGet';
import { BuckSet } from './buckSet';

export const numberOfBucks = 2;

const buckDefaults = (): Buck => ({
    vOutNormal: buckVoltageRange().min,
    vOutRetention: 1,
    mode: 'vSet',
    enabled: true,
    modeControl: 'Auto',
    onOffControl: 'Off',
    onOffSoftwareControlEnabled: true,
    retentionControl: 'Off',
    activeDischarge: false,
});

export const toBuckExport = (buck: Buck): BuckExport => ({
    vOutNormal: buck.vOutNormal,
    vOutRetention: buck.vOutRetention,
    mode: buck.mode,
    modeControl: buck.modeControl,
    onOffControl: buck.onOffControl,
    retentionControl: buck.retentionControl,
    enabled: buck.enabled,
    activeDischarge: buck.activeDischarge,
});

const buckVoltageRange = () =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
    } as RangeType);

const buckRetVOutRange = () =>
    ({
        min: 1,
        max: 3,
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
) =>
    [...Array(numberOfBucks).keys()].map(i => ({
        get: new BuckGet(sendCommand, i),
        set: new BuckSet(
            eventEmitter,
            sendCommand,
            dialogHandler,
            offlineMode,
            i
        ),
        callbacks: buckCallbacks(shellParser, eventEmitter, i),
        ranges: {
            voltage: buckVoltageRange(),
            retVOut: buckRetVOutRange(),
        },
        defaults: buckDefaults(),
    }));
