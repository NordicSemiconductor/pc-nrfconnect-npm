/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '../../../hooks/commandParser';
import { getNPM1300 } from './pmic1300Device';
import { NpmDevice, PmicWarningDialog } from './types';

export const getNpmDevice = (
    shellParser: ShellParser | undefined,
    warningDialogHandler: (pmicWarningDialog: PmicWarningDialog) => void
): NpmDevice =>
    // TODO query device chip model ?
    getNPM1300(shellParser, warningDialogHandler);
