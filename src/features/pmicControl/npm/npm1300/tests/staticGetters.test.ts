/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_BUCKS, PMIC_1300_LDOS, setupMocksBase } from './helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(pmic.hasCharger()).toBeTruthy());

    test('Number of Bucks', () => expect(pmic.getNumberOfBucks()).toBe(2));

    test('Number of LDOs', () => expect(pmic.getNumberOfLdos()).toBe(2));

    test('Number of GPIOs', () => expect(pmic.getNumberOfGPIOs()).toBe(5));

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(3));

    test('Device Type', () => expect(pmic.getDeviceType()).toBe('npm1300'));

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

    test.each(PMIC_1300_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.getBuckVoltageRange(index)).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
        })
    );

    test.each(PMIC_1300_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.getBuckRetVOutRange(index)).toStrictEqual({
            min: 1,
            max: 3,
            decimals: 1,
        })
    );

    test.each(PMIC_1300_LDOS)('LDO Voltage Range index: %p', index =>
        expect(pmic.getLdoVoltageRange(index)).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        })
    );
});

export {};
