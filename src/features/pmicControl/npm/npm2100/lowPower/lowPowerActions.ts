/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type PmicDialog } from '../../types';

export class LowPowerActions {
    constructor(
        private sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        private dialogHandler: ((pmicDialog: PmicDialog) => void) | null,
    ) {}

    enterShipMode() {
        this.sendCommand(`npm2100 low_power_control ship_mode set ENABLE`);
    }
    enterShipHibernateMode() {
        this.sendCommand(`npm2100 low_power_control hibernate_mode set ENABLE`);
    }

    enterHibernatePtMode() {
        this.sendCommand(
            `npm2100 low_power_control hibernate_pt_mode set ENABLE`,
        );
    }

    enterBreakToWake() {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                'npm2100 low_power_control pwr_btn set OFF',
                () => {
                    const action = () => {
                        this.sendCommand(
                            'npm2100 low_power_control ship_mode_configure resistor set NONE',
                        );
                        this.sendCommand(
                            'npm2100 low_power_control wakeup_configure edge_polarity set RISING',
                        );
                        this.sendCommand(
                            'npm2100 low_power_control ship_mode_configure current set LOW',
                        );
                        this.sendCommand(
                            'npm2100 low_power_control ship_mode set ENABLE',
                        );
                    };

                    if (this.dialogHandler) {
                        this.dialogHandler({
                            type: 'alert',
                            message: `To use the Break-to-wake mode, physically connect the SHPHLD pin to GND on the nPM2100 EK.`,
                            confirmLabel: 'Continue',
                            cancelLabel: 'Cancel',
                            title: 'Break-to-wake hardware setup',
                            onConfirm: () => {
                                action();
                                resolve();
                            },
                            onCancel: () => {
                                this.sendCommand(
                                    'npm2100 low_power_control pwr_btn set ON',
                                    () => resolve(),
                                    reject,
                                );
                            },
                        });
                    } else {
                        action();
                    }
                },
                () => {
                    this.sendCommand(
                        'npm2100 low_power_control pwr_btn set ON',
                    );
                },
            );
        });
    }
}
