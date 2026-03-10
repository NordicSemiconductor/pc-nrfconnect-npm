/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum SoftStartCurrent {
    '10 mA' = 10,
    '20 mA' = 20,
    '35 mA' = 35,
    '50 mA' = 50,
}

export const SoftStartCurrentValues = Object.keys(SoftStartCurrent)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const SoftStartCurrentKeys = Object.values(SoftStartCurrent).filter(
    key => Number.isNaN(Number(key)),
);
