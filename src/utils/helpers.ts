/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import lodashRange from 'lodash.range';

export interface RangeType {
    min: number;
    max: number;
    decimals?: number;
    step?: number;
}

export const getRange = (ranges: RangeType[]): number[] => {
    const out: number[] = [];

    ranges.forEach(range => {
        lodashRange(
            range.min,
            range.max + (range.step ?? 1),
            range.step
        ).forEach((_value, index) => {
            const v = range.min + index * (range.step ?? 1);
            if (v >= range.min && v <= range.max) {
                out.push(range.min + index * (range.step ?? 1));
            }
        });
    });

    return out;
};
