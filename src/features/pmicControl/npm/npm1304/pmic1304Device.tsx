/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import nPM1300BuckModule from '../npm1300/pmic1300Device';
import { PmicDialog } from '../types';
import { BatteryProfiler } from './batteryProfiler';
import ChargerModule from './charger';

export const npm1304FWVersion = '0.0.0+0';

/* eslint-disable no-underscore-dangle */

export default class Npm1304 extends nPM1300BuckModule {
    constructor(
        shellParser: ShellParser | undefined,
        dialogHandler: ((dialog: PmicDialog) => void) | null
    ) {
        super(shellParser, dialogHandler, 'npm1304', npm1304FWVersion);
    }

    protected initChargerModule(): void {
        this.chargerModule = new ChargerModule(
            this.shellParser,
            this.eventEmitter,
            this.sendCommand.bind(this),
            this.offlineMode
        );
    }

    protected initBatteryModule(): void {
        this._batteryProfiler = this.shellParser
            ? new BatteryProfiler(this.shellParser, this.eventEmitter)
            : undefined;
    }
}
