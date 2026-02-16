/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum SoftStart {
    '25 mA' = 25,
    '50 mA' = 50,
    '75 mA' = 75,
    '100 mA' = 100,
}

export const SoftStartValues = Object.keys(SoftStart)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const SoftStartKeys = Object.values(SoftStart).filter(key =>
    Number.isNaN(Number(key)),
);
