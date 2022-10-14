
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

export const getRange = (ranges: RangeType[]): number[] => {
    let out:number[] = [];

    ranges.forEach((range) => {
        const steps =  ((range.max - range.min) / range.step) + 1; 
        out = [...out, ...Array.from({length: steps}, (_, index) => range.min + (range.step * index))];
    })

    return out;
}
