/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const longPressResetPinSelKV = [
    ['OFF', 'Disabled'],
    ['GPIO', 'GPIO'],
    ['SHPHLD', 'SHPHLD'],
    ['BOTH', 'GPIO & SHPHLD'],
] as const;
export const longPressResetPinSelKeys = longPressResetPinSelKV.map(kv => kv[0]);
export const longPressResetPinSelValues = longPressResetPinSelKV.map(
    kv => kv[1],
);
export type LongPressResetPinSel = (typeof longPressResetPinSelKeys)[number];

export const longPressResetDebounceKV = [
    ['3s', '3 s'],
    ['5s', '5 s'],
    ['10s', '10 s'],
    ['20s', '20 s'],
] as const;
export const longPressResetDebounceKeys = longPressResetDebounceKV.map(
    kv => kv[0],
);
export const longPressResetDebounceValues = longPressResetDebounceKV.map(
    kv => kv[1],
);
export type LongPressResetDebounce =
    (typeof longPressResetDebounceKeys)[number];

export const powerDownWaitKV = [
    ['50ms', '50 ms'],
    ['150ms', '150 ms'],
    ['250ms', '250 ms'],
    ['350ms', '350 ms'],
] as const;
export const powerDownWaitKeys = powerDownWaitKV.map(kv => kv[0]);
export const powerDownWaitValues = powerDownWaitKV.map(kv => kv[1]);
export type PowerDownWait = (typeof powerDownWaitKeys)[number];
