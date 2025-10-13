/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum npm1300TimerMode {
    'Boot monitor' = 0,
    'Watchdog warning' = 1,
    'Watchdog reset' = 2,
    'General purpose' = 3,
    'Wake-up' = 4,
}
export const TimerModeValues = Object.keys(npm1300TimerMode)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const TimerModeKeys = Object.values(npm1300TimerMode).filter(key =>
    Number.isNaN(Number(key)),
);
