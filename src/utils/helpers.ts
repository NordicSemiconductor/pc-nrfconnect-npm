/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface RangeType {
    min: number;
    max: number;
    decimals?: number;
    step?: number;
}

const getDecimalPlaces = (value: number): number => {
    if (!Number.isFinite(value)) return 0;

    const str = value.toString();
    if (str.includes('e')) {
        // Handle scientific notation
        const [base, exp] = str.split('e');
        const decimalPlaces =
            (base.split('.')[1]?.length ?? 0) - Number.parseInt(exp, 10);
        return Math.max(0, decimalPlaces);
    }

    const decimalPart = str.split('.')[1];
    return decimalPart ? decimalPart.length : 0;
};

export const getRange = (ranges: RangeType[]): number[] => {
    const out: number[] = [];

    ranges.forEach(range => {
        const decimals = range.decimals ?? getDecimalPlaces(range.step ?? 1);
        const step = range.step ?? 1;
        for (
            let v = range.min;
            v <= range.max;
            v = Number.parseFloat((v + step).toFixed(decimals))
        ) {
            // To handle floating-point precision if decimals is specified

            const factor = 10 ** decimals;
            out.push(Math.round(v * factor) / factor);
        }
    });

    return out;
};
