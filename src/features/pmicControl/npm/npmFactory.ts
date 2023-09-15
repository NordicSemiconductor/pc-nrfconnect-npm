/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getNPM1300 } from './pmic1300Device';
import { NpmDevice, PmicDialog } from './types';

export const getNpmDevice = (
    shellParser: ShellParser | undefined,
    dialogHandler: ((pmicDialog: PmicDialog) => void) | null
): Promise<NpmDevice> =>
    new Promise<NpmDevice>((resolve, reject) => {
        if (shellParser) {
            shellParser.enqueueRequest('hw_version', {
                onSuccess: response => {
                    switch (response) {
                        case 'hw_version=npm1300ek_nrf5340_cpuapp':
                            resolve(getNPM1300(shellParser, dialogHandler));
                            break;
                        default:
                            reject(new Error('Unknown hardware'));
                    }
                },
                onError: reject,
            });
        } else {
            resolve(getNPM1300(undefined, dialogHandler));
        }
    });
