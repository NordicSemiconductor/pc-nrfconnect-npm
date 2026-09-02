/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const vBusILimKV = [
    ['10mA', '10 mA'],
    ['100mA', '100 mA'],
    ['225mA', '225 mA'],
    ['300mA', '300 mA'],
] as const;
export const vBusILimKeys = vBusILimKV.map(kv => kv[0]);
export const vBusILimValues = vBusILimKV.map(kv => kv[1]);
export type VBusILim = (typeof vBusILimKeys)[number];

export const vBusDpmKV = [
    ['OFF', 'Disabled'],
    ['4.35V', '4.35 V'],
    ['4.5V', '4.5 V'],
    ['4.65V', '4.65 V'],
    ['4.8V', '4.8 V'],
] as const;
export const vBusDpmKeys = vBusDpmKV.map(kv => kv[0]);
export const vBusDpmValues = vBusDpmKV.map(kv => kv[1]);
export type VBusDpm = (typeof vBusDpmKeys)[number];
