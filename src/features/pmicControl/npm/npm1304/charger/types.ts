/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum ITermNpm1304 {
    '5%' = 5,
    '10%' = 10,
}

export const ITermValues = Object.keys(ITermNpm1304)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const ITermKeys = Object.values(ITermNpm1304).filter(key =>
    Number.isNaN(Number(key))
);
