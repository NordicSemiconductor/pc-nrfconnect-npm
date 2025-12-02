/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum ITermNpm1012 {
    '10%' = 10,
    '20%' = 20,
}

export const ITermValues = Object.keys(ITermNpm1012)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const ITermKeys = Object.values(ITermNpm1012).filter(key =>
    Number.isNaN(Number(key)),
);

export enum VTrickleFast1012 {
    '2.5 V' = 2.5,
    '2.9 V' = 2.9,
}

export const VTrickleFastValues = Object.keys(VTrickleFast1012)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const VTrickleFastKeys = Object.values(VTrickleFast1012).filter(key =>
    Number.isNaN(Number(key)),
);
