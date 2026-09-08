/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum TimeToActive {
    '16ms' = '16',
    '32ms' = '32',
    '64ms' = '64',
    '96ms' = '96',
    '304ms' = '304',
    '608ms' = '608',
    '1008ms' = '1008',
    '3008ms' = '3008',
}

export const timeToActiveKeys = Object.keys(TimeToActive);
export const timeToActiveValues = timeToActiveKeys.map(
    key => TimeToActive[key as keyof typeof TimeToActive],
);
