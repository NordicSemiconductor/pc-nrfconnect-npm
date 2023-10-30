/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import fuelGaugeCallbacks from './fuelGaugeCallbacks';
import { fuelGaugeGet, fuelGaugeSet } from './fuelGaugeEffects';
import {
    profileDownloadCallbacks,
    profileDownloadSet,
} from './profileDownload';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void,
        unique?: boolean
    ) => void,
    offlineMode: boolean
) => ({
    fuelGaugeGet: fuelGaugeGet(sendCommand),
    fuelGaugeSet: {
        ...fuelGaugeSet(eventEmitter, sendCommand, offlineMode),
        ...profileDownloadSet(eventEmitter, sendCommand),
    },
    fuelGaugeCallbacks: [
        ...fuelGaugeCallbacks(shellParser, eventEmitter, sendCommand),
        ...profileDownloadCallbacks(shellParser, eventEmitter),
    ],
});
