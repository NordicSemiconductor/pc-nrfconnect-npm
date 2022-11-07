/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import lodashRange from 'lodash.range';

export interface RangeType {
    min: number;
    max: number;
    step: number;
}

export const getRange = (ranges: RangeType[]): number[] => {
    const out: number[] = [];

    ranges.forEach(range => {
        lodashRange(range.min, range.max + range.step, range.step).map(
            (_value, index) => out.push(range.min + index * range.step)
        );
    });

    return out;
};
