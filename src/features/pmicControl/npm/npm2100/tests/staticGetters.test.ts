/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isFixedListRangeWithLabel } from '../../types';
import { PMIC_2100_BUCKS, PMIC_2100_LDOS, setupMocksBase } from './helpers';

describe('PMIC 2100 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(pmic.hasCharger()).toBeFalsy());

    test('Number of Bucks', () => expect(pmic.getNumberOfBucks()).toBe(0));

    test('Number of LDOs', () => expect(pmic.getNumberOfLdos()).toBe(1));

    test('Number of GPIOs', () => expect(pmic.getNumberOfGPIOs()).toBe(2));

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(0));

    test('Device Type', () => expect(pmic.getDeviceType()).toBe('npm2100'));

    test('Charger Voltage Range', () =>
        expect(pmic.getChargerVoltageRange()).toStrictEqual([
            3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4,
            4.45,
        ]));

    test('Charger Voltage Warm Range', () =>
        expect(pmic.getChargerVTermRRange()).toStrictEqual([
            3.5, 3.55, 3.6, 3.65, 4, 4.05, 4.1, 4.15, 4.2, 4.25, 4.3, 4.35, 4.4,
            4.45,
        ]));

    test('Charger Chip Thermal Range', () =>
        expect(pmic.getChargerChipThermalRange()).toStrictEqual({
            min: 50,
            max: 110,
        }));

    test('Charger Jeita Range', () =>
        expect(pmic.getChargerJeitaRange()).toStrictEqual({
            min: -20,
            max: 60,
        }));

    test('Charger Current Range', () =>
        expect(pmic.getChargerCurrentRange()).toStrictEqual({
            min: 32,
            max: 800,
            decimals: 0,
            step: 2,
        }));

    test('Charger Current Range', () => {
        const range = pmic.getChargerIBatLimRange();

        expect(isFixedListRangeWithLabel(range)).toBeTruthy();
        if (isFixedListRangeWithLabel(range)) {
            expect(range.toLabel?.(1340)).toBe('High');
            expect(range.toLabel?.(271)).toBe('Low');
            expect(range.toLabel?.(1000)).toBe('Manual (1000 mA)');
            expect(range.map(v => v.valueOf())).toStrictEqual([1340, 271]);
        }
    });

    test.each(PMIC_2100_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.getBuckVoltageRange(index)).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
        })
    );

    test.each(PMIC_2100_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.getBuckRetVOutRange(index)).toStrictEqual({
            min: 1,
            max: 3,
            decimals: 1,
        })
    );

    test.each(PMIC_2100_LDOS)('LDO Voltage Range index: %p', index =>
        expect(pmic.getLdoVoltageRange(index)).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        })
    );

    test('Charger Current Range', () =>
        expect(pmic.getPOFThresholdRange()).toStrictEqual({
            min: 2.6,
            max: 3.5,
            decimals: 1,
            step: 0.1,
        }));

    test('Charger NTC Beta Range', () =>
        expect(pmic.getChargerNTCBetaRange()).toStrictEqual({
            min: 0,
            max: 4294967295,
            decimals: 0,
            step: 1,
        }));

    test('USB Power Current Limiter Range', () =>
        expect(pmic.getUSBCurrentLimiterRange()).toStrictEqual([
            0.1, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5,
        ]));
});

export {};
