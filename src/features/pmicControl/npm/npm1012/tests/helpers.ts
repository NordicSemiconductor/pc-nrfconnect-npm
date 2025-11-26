/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    setupMocksBase as GenericsetupMocksBase,
    setupMocksWithShellParser as GenericSetupMocksWithShellParser,
} from '../../tests/helpers';
import { PmicDialog } from '../../types';
import Npm1012 from '../pmic1012Device';

export const PMIC_1012_BUCKS = [0, 1];
export const PMIC_1012_LDOS = [0, 1];
export const PMIC_1012_GPIOS = [0, 1, 2, 3, 4];
export const PMIC_1012_LEDS = [0, 1, 2];

export const setupMocksBase = (
    shellParser: ShellParser | undefined = undefined,
) =>
    GenericsetupMocksBase(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null,
        ) => new Npm1012(sp, dialogHandler),
        shellParser,
    );

export const setupMocksWithShellParser = () =>
    GenericSetupMocksWithShellParser(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null,
        ) => new Npm1012(sp, dialogHandler),
    );
