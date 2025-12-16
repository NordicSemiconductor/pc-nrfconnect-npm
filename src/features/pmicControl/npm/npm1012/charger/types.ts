/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum ITerm1012 {
    '10%' = 10,
    '20%' = 20,
}
export const ITermValues = Object.keys(ITerm1012)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const ITermKeys = Object.values(ITerm1012).filter(key =>
    Number.isNaN(Number(key)),
);

export enum ITrickle1012 {
    '0.78%' = 0.78,
    '1.56%' = 1.56,
    '3.125%' = 3.125,
    '6.25%' = 6.25,
    '12.5%' = 12.5,
    '25%' = 25,
    '50%' = 50,
    '100%' = 100,
}
const ITrickleKV = Object.entries(ITrickle1012).filter(
    entry => !Number.isNaN(Number(entry[1])),
);
export const ITrickleKeys = ITrickleKV.map(kv => kv[0]);
export const ITrickleValues = ITrickleKV.map(kv => Number(kv[1]));

// Disable options '0.78%' and '1.56%' when IChg > 8 mA
const ITrickleKVWhenIChgBelow8mA = ITrickleKV.filter(
    kv => Number(kv[1]) > 1.56,
);
export const ITrickleKeysWhenIChgBelow8mA = ITrickleKVWhenIChgBelow8mA.map(
    kv => kv[0],
);
export const ITrickleValuesWhenIChgBelow8mA = ITrickleKVWhenIChgBelow8mA.map(
    kv => Number(kv[1]),
);

export enum VTrickleFast1012 {
    '2.5 V' = 2.5,
    '2.7 V' = 2.7,
    '2.9 V' = 2.9,
    '3.1 V' = 3.1,
}
export const VTrickleFastValues = Object.keys(VTrickleFast1012)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const VTrickleFastKeys = Object.values(VTrickleFast1012).filter(key =>
    Number.isNaN(Number(key)),
);
