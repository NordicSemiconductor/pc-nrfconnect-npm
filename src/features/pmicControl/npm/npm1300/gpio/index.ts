/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { NpmEventEmitter } from '../../pmicHelpers';
import { GPIO } from '../../types';
import gpioCallbacks from './gpioCallbacks';
import { gpioGet, gpioSet } from './gpioEffects';

export const gpioDefaults = (noOfGpios: number): GPIO[] => {
    const defaultGPIOs: GPIO[] = [];
    for (let i = 0; i < noOfGpios; i += 1) {
        defaultGPIOs.push({
            mode: 'Input',
            pull: 'Pull up',
            drive: 1,
            openDrain: false,
            debounce: false,
        });
    }
    return defaultGPIOs;
};

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
