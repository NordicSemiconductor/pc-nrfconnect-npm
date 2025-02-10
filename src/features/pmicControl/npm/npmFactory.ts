/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import BaseNpmDevice from './basePmicDevice';
import Npm1300 from './npm1300/pmic1300Device';
import Npm2100 from './npm2100/pmic2100Device';
import { PmicDialog } from './types';

export const getNpmDevice = (
    shellParser: ShellParser,
    dialogHandler: ((pmicDialog: PmicDialog) => void) | null
): Promise<BaseNpmDevice> =>
    new Promise<BaseNpmDevice>((resolve, reject) => {
        shellParser.enqueueRequest('hw_version', {
            onSuccess: response => {
                const hwVersion = response
                    .split(',')
                    .find(s => s.startsWith('hw_version'));
                switch (hwVersion) {
                    case 'hw_version=npm1300ek_nrf5340_cpuapp':
                        resolve(new Npm1300(shellParser, dialogHandler));
                        break;
                    case 'hw_version=npm2100ek_nrf5340_cpuapp':
                        resolve(new Npm2100(shellParser, dialogHandler));
                        break;
                    default:
                        reject(new Error('Unknown hardware'));
                }
            },
            onError: reject,
        });
    });
