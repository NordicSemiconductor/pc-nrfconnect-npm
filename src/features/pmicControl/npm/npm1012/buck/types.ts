/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const BuckModeControlValues1012 = ['GPIO', 'LP', 'ULP'] as const;
export type BuckModeControl1012 = (typeof BuckModeControlValues1012)[number];

export const BuckOnOffControlValues1012 = ['GPIO', 'Software', 'VSET'] as const;
export type BuckOnOffControl1012 = (typeof BuckOnOffControlValues1012)[number];

export const BuckAlternateVOutControlValues1012 = [
    'GPIO',
    'Off',
    'Software',
] as const;
export type BuckAlternateVOutControl1012 =
    (typeof BuckAlternateVOutControlValues1012)[number];

export const BuckVOutRippleControlValues1012 = [
    'High',
    'Low',
    'Nominal',
] as const;
export type BuckVOutRippleControl1012 =
    (typeof BuckVOutRippleControlValues1012)[number];
