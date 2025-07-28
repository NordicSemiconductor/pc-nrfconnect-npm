/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isFixedListRangeWithLabel } from '../../types';
import { setupMocksBase } from '../tests/helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(!!pmic.chargerModule).toBeTruthy());

    test('Charger Voltage Range', () =>
        expect(pmic.chargerModule?.ranges.voltage).toStrictEqual([
            3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4,
            4.45,
        ]));

    test('Charger Voltage Warm Range', () =>
        expect(pmic.chargerModule?.ranges.vTermR).toStrictEqual([
            3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4,
            4.45,
        ]));

    test('Charger Chip Thermal Range', () =>
        expect(pmic.chargerModule?.ranges.chipThermal).toStrictEqual({
            min: 50,
            max: 110,
        }));

    test('Charger Jeita Range', () =>
        expect(pmic.chargerModule?.ranges.jeita).toStrictEqual({
            min: -20,
            max: 60,
        }));

    test('Charger Current Range', () =>
        expect(pmic.chargerModule?.ranges.current).toStrictEqual({
            min: 32,
            max: 800,
            decimals: 0,
            step: 2,
        }));

    test('Charger Current Range', () => {
        const range = pmic.chargerModule?.ranges.iBatLim;

        expect(range).toBeDefined();
        expect(isFixedListRangeWithLabel(range!)).toBeTruthy();
        if (isFixedListRangeWithLabel(range!)) {
            expect(range.toLabel?.(1000)).toBe('High');
            expect(range.toLabel?.(200)).toBe('Low');
            expect(range.toLabel?.(1200)).toBe('Manual (1200 mA)');
            expect(range.map(v => v.valueOf())).toStrictEqual([1000, 200]);
        }
    });

    test('Charger Current Range', () =>
        expect(pmic.pofModule?.ranges.threshold).toStrictEqual({
            min: 2.6,
            max: 3.5,
            decimals: 1,
            step: 0.1,
        }));

    test('Charger NTC Beta Range', () =>
        expect(pmic.chargerModule?.ranges.nTCBeta).toStrictEqual({
            min: 0,
            max: 4294967295,
            decimals: 0,
            step: 1,
        }));
});

export {};
