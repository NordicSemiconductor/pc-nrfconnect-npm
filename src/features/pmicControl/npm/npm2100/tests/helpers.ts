/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    setupMocksBase as GenericsetupMocksBase,
    setupMocksWithShellParser as GenericSetupMocksWithShellParser,
} from '../../tests/helpers';
import { PmicDialog } from '../../types';
import Npm2100 from '../pmic2100Device';

export const PMIC_2100_BOOST = [0];
export const PMIC_2100_LDOS = [0];
export const PMIC_2100_GPIOS = [0, 1];

export const setupMocksBase = (
    shellParser: ShellParser | undefined = undefined
) =>
    GenericsetupMocksBase(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null
        ) => new Npm2100(sp, dialogHandler),
        shellParser
    );

export const setupMocksWithShellParser = () =>
    GenericSetupMocksWithShellParser(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null
        ) => new Npm2100(sp, dialogHandler)
    );
