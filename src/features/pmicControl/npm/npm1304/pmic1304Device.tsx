/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import nPM1300Device from '../npm1300/pmic1300Device';
import { PmicDialog } from '../types';
import { BatteryProfiler } from './batteryProfiler';
import ChargerModule from './charger';

export const npm1304FWVersion = '0.0.0+0';

export default class Npm1304 extends nPM1300Device {
    constructor(
        shellParser: ShellParser | undefined,
        dialogHandler: ((dialog: PmicDialog) => void) | null
    ) {
        super(
            shellParser,
            dialogHandler,
            {
                ChargerModule,
                BatteryProfiler,
            },
            'npm1304',
            npm1304FWVersion
        );
    }
}
