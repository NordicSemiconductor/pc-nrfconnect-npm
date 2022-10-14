/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeProp } from './rangeShape';

export const constrainedToPercentage = (percentage: number) => {
    if (percentage < 0) return 0;
    if (percentage > 100) return 100;
    return percentage;
};

export const toPercentage = (
    value: number,
    { min, max }: RangeProp
) => {    
    return ((value - min) * 100) / (max - min);
} 

export const fromPercentage = (
    value: number,
    { min, max, decimals = 0, step = null, explicitRange = []}: RangeProp,
    directionForward: boolean = false
) => {

    if (explicitRange.length > 0) {
        const noOfIndexes = explicitRange.length - 1;

        const computedValue = Number(((value * (max - min)) / 100 + min).toFixed(decimals as number));
        
        const closestPrev = [...explicitRange].filter((v) => computedValue > v).pop();
        const closestNext =  [...explicitRange].filter((v) => computedValue < v)[0];

        let closestPrevIndex = 0;
        let closestNextIndex = noOfIndexes;

        if (typeof closestPrev !== 'undefined') {
            closestPrevIndex = explicitRange.indexOf(closestPrev);
        }

        if (typeof closestNext !== 'undefined') {
            closestNextIndex = explicitRange.indexOf(closestNext);
        }

        const deltaMax = explicitRange[closestNextIndex] - explicitRange[closestPrevIndex];
        const precentDelta = (explicitRange[closestNextIndex] - computedValue) / deltaMax
        
        let closestIndex = -1;

        if (directionForward) {
            closestIndex = (precentDelta + 0.5) <= 0.5 ? closestNextIndex : closestPrevIndex;
        } else {
            closestIndex = (precentDelta - 0.5) >= 0.5 ? closestPrevIndex : closestNextIndex;
        }


        return Number((explicitRange[closestIndex]).toFixed(decimals as number));
    } else if (step != null) {
        const noOfSteps = (max - min) / step;
        const closestStep = Math.round(((value) / 100 ) * noOfSteps);

        return Number((min + (closestStep * step)).toFixed(decimals as number));
    } else {
        return Number(((value * (max - min)) / 100 + min).toFixed(decimals as number));
    }
};
