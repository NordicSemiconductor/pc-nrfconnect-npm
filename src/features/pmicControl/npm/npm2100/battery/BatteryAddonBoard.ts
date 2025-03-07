/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const batteryAddonBoards = new Map<number, string>([
    [0, 'Undetected'],
    [1, 'xR20xx'],
    [2, 'AAA'],
    [3, 'AA'],
    [4, 'xR44'],
    [5, 'AAA 2S'],
    [6, 'AA 2S'],
    [7, 'xR44 2S'],
    [8, 'xR10xx'],
    [9, 'xR12xx'],
    [10, 'xR16xx'],
]);

export function getBatteryAddonBoard(addonBoardId: number): string {
    return batteryAddonBoards.get(addonBoardId) ?? 'UNKNOWN';
}
