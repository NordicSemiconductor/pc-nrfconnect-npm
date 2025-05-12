/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryProfiler as nPM1300BatteryProfiler } from '../npm1300/batteryProfiler';

export class BatteryProfiler extends nPM1300BatteryProfiler {
    // eslint-disable-next-line class-methods-use-this
    canProfile() {
        return Promise.resolve(true);
    }
}
