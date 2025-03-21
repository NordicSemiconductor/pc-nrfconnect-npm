/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NpmEventEmitter } from '../../pmicHelpers';

export class LowPowerActions {
    // eslint-disable-next-line no-useless-constructor
    constructor(
        private eventEmitter: NpmEventEmitter,
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void
        ) => void,
        private offlineMode: boolean
    ) {}

    enterShipMode() {
        this.sendCommand(`npm2100 low_power_control ship_mode set ENABLE`);
    }
    enterShipHibernateMode() {
        this.sendCommand(`npm2100 low_power_control hibernate_mode set ENABLE`);
    }

    enterHibernatePtMode() {
        this.sendCommand(
            `npm2100 low_power_control hibernate_pt_mode set ENABLE`
        );
    }

    exitBreakToWake() {
        this.sendCommand('npm2100 low_power_control pwr_btn set ON');
    }

    enterBreakToWakeStep1() {
        this.sendCommand('npm2100 low_power_control pwr_btn set OFF');
    }

    enterBreakToWakeStep2() {
        this.sendCommand(
            'npm2100 low_power_control ship_mode_configure resistor set NONE'
        );
        this.sendCommand(
            'npm2100 low_power_control wakeup_configure edge_polarity set RISING'
        );
        this.sendCommand(
            'npm2100 low_power_control ship_mode_configure current set LOW'
        );
        this.sendCommand('npm2100 low_power_control ship_mode set ENABLE');
    }
}
