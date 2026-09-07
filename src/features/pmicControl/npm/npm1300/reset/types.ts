/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const longPressResetPinSelKV = [
    ['one_button', 'One Button (SHPHLD)'],
    ['two_button', 'Two Buttons (SHPHLD and GPIO0)'],
    ['disabled', 'Disabled'],
] as const;
export const longPressResetPinSelKeys = longPressResetPinSelKV.map(kv => kv[0]);
export const longPressResetPinSelValues = longPressResetPinSelKV.map(
    kv => kv[1],
);
export type LongPressResetPinSel = (typeof longPressResetPinSelKeys)[number];
