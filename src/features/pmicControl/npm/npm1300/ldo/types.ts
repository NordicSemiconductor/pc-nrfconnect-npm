/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum SoftStart {
    '10 mA' = 10,
    '20 mA' = 20,
    '35 mA' = 35,
    '50 mA' = 50,
}

export const SoftStartValues = Object.keys(SoftStart)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const SoftStartKeys = Object.values(SoftStart).filter(key =>
    Number.isNaN(Number(key))
);
