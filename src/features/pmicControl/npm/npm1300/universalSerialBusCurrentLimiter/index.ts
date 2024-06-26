/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getRange } from '../../../../../utils/helpers';
import { NpmEventEmitter } from '../../pmicHelpers';
import { UsbCurrentLimiterModule } from '../../types';
import callbacks from './callbacks';
import { UsbCurrentLimiterGet } from './getter';
import { UsbCurrentLimiterSet } from './setter';

export default (
    shellParser: ShellParser | undefined,
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void
    ) => void,
    offlineMode: boolean
): UsbCurrentLimiterModule => ({
    get: new UsbCurrentLimiterGet(sendCommand),
    set: new UsbCurrentLimiterSet(eventEmitter, sendCommand, offlineMode),
    callbacks: callbacks(shellParser, eventEmitter),
    defaults: {
        detectStatus: 'No USB connection',
        currentLimiter: 0.1,
    },
    ranges: {
        vBusInLimiter: [
            0.1,
            ...getRange([
                {
                    min: 0.5,
                    max: 1.5,
                    step: 0.1,
                },
            ]).map(v => Number(v.toFixed(2))),
        ],
    },
});
