/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const timeToActiveKV = [
    ['OFF', 'No Debounce'],
    ['50ms', '50 ms'],
    ['100ms', '100 ms'],
    ['500ms', '500 ms'],
    ['1000ms', '1000 ms'],
] as const;
export const timeToActiveKeys = timeToActiveKV.map(kv => kv[0]);
export const timeToActiveValues = timeToActiveKV.map(kv => kv[1]);
export type TimeToActive = (typeof timeToActiveKeys)[number];
