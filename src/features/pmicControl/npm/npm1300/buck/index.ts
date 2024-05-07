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
import { buckGet, buckSet } from './buckEffects';

export const buckDefaults = (noOfBucks: number): Buck[] => {
    const defaultBucks: Buck[] = [];
    for (let i = 0; i < noOfBucks; i += 1) {
        defaultBucks.push({
            vOutNormal: getBuckVoltageRange(i).min,
            vOutRetention: 1,
            mode: 'vSet',
            enabled: true,
            modeControl: 'Auto',
            onOffControl: 'Off',
            onOffSoftwareControlEnabled: true,
            retentionControl: 'Off',
            activeDischarge: false,
        });
    }

    return defaultBucks;
};

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getBuckVoltageRange = (i: number) =>
    ({
        min: 1,
        max: 3.3,
        decimals: 1,
    } as RangeType);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getBuckRetVOutRange = (i: number) =>
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
    offlineMode: boolean,
    noOfBucks: number
) => ({
    buckGet: buckGet(sendCommand),
    buckSet: buckSet(eventEmitter, sendCommand, dialogHandler, offlineMode),
    buckCallbacks: buckCallbacks(shellParser, eventEmitter, noOfBucks),
    buckRanges: {
        getBuckVoltageRange,
        getBuckRetVOutRange,
    },
});
