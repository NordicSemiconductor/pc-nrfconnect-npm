/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const modeKV = [
    ['GENERAL_PURPOSE', 'General purpose'],
    ['WAKEUP', 'Wake-up'],
    ['WATCHDOG_POWERCYCLE', 'Watchdog Power Cycle'],
    ['WATCHDOG_RESET', 'Watchdog Reset'],
] as const;
export const modeKeys = modeKV.map(kv => kv[0]);
export const modeValues = modeKV.map(kv => kv[1]);
export type Mode = (typeof modeKeys)[number];
