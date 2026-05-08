/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum TimeToActive {
    'DISABLE' = 'OFF',
    '10ms' = '10',
    '30ms' = '30',
    '60ms' = '60',
    '100ms' = '100',
    '300ms' = '300',
    '600ms' = '600',
    '1s' = '1000',
    '3s' = '3000',
}

export const timeToActiveKeys = Object.keys(TimeToActive);
export const timeToActiveValues = timeToActiveKeys.map(
    key => TimeToActive[key as keyof typeof TimeToActive],
);
