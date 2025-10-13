/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import BaseNpmDevice from './basePmicDevice';
import Npm1300 from './npm1300/pmic1300Device';
import Npm1304 from './npm1304/pmic1304Device';
import Npm2100 from './npm2100/pmic2100Device';
import { parseHwVersion } from './pmicHelpers';
import { PmicDialog } from './types';

export const getNpmDevice = (
    shellParser: ShellParser,
    dialogHandler: ((pmicDialog: PmicDialog) => void) | null,
): Promise<BaseNpmDevice> =>
    new Promise<BaseNpmDevice>((resolve, reject) => {
        shellParser.enqueueRequest('hw_version', {
            onSuccess: response => {
                const parsedHwVersion = parseHwVersion(response);
                const hwVersion = parsedHwVersion.hw_version;
                if (hwVersion?.startsWith('npm1300ek')) {
                    resolve(new Npm1300(shellParser, dialogHandler));
                } else if (hwVersion?.startsWith('npm1304ek')) {
                    resolve(
                        new Npm1304(
                            shellParser,
                            dialogHandler,
                            parsedHwVersion.version,
                        ),
                    );
                } else if (hwVersion?.startsWith('npm2100ek')) {
                    resolve(new Npm2100(shellParser, dialogHandler));
                } else {
                    reject(new Error('Unknown hardware'));
                }
            },
            onError: reject,
        });
    });
