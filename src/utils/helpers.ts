
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface RangeType {
    min: number
    max: number
    step: number;
}

import lodashRange from 'lodash.range';

export const getRange = (ranges: RangeType[]): number[] => {
    let out:number[] = [];

    ranges.forEach((range) => {
        lodashRange(range.min, range.max + range.step, range.step).map( (value, index) => {
            out.push(range.min + (index*range.step));
        })
    })

    return out;
}
