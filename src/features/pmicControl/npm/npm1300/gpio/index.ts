/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import gpioCallbacks from './gpioCallbacks';
import { gpioGet, gpioSet } from './gpioEffects';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean,
    noOfBucks: number
) => ({
    gpioGet: gpioGet(sendCommand),
    gpioSet: gpioSet(eventEmitter, sendCommand, offlineMode),
    gpioCallbacks: gpioCallbacks(shellParser, eventEmitter, noOfBucks),
});
