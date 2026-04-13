/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const longPressResetPinSelKV = [
    ['disabled', 'Disabled'],
    ['one_button', 'One button (SHPHLD)'],
    ['two_button', 'Two buttons (SHPHLD and GPIO0)'],
] as const;
export const longPressResetPinSelKeys = longPressResetPinSelKV.map(kv => kv[0]);
export const longPressResetPinSelValues = longPressResetPinSelKV.map(
    kv => kv[1],
);
export type LongPressResetPinSel = (typeof longPressResetPinSelKeys)[number];
