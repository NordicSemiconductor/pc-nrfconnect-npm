/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
} from '../../npm1300/tests/helpers';
import {
    setupMocksBase as GenericsetupMocksBase,
    setupMocksWithShellParser as GenericSetupMocksWithShellParser,
} from '../../tests/helpers';
import { PmicDialog } from '../../types';
import Npm1304 from '../pmic1304Device';

export const PMIC_1304_BUCKS = PMIC_1300_BUCKS;
export const PMIC_1304_LDOS = PMIC_1300_LDOS;
export const PMIC_1304_GPIOS = PMIC_1300_GPIOS;
export const PMIC_1304_LEDS = PMIC_1300_LEDS;

export const setupMocksBase = (
    shellParser: ShellParser | undefined = undefined
) =>
    GenericsetupMocksBase(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null
        ) => new Npm1304(sp, dialogHandler),
        shellParser
    );

export const setupMocksWithShellParser = () =>
    GenericSetupMocksWithShellParser(
        (
            sp: ShellParser | undefined,
            dialogHandler: ((dialog: PmicDialog) => void) | null
        ) => new Npm1304(sp, dialogHandler)
    );
