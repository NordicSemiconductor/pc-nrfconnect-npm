/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_BUCKS, PMIC_2100_LDOS, setupMocksBase } from './helpers';

describe('PMIC 2100 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(pmic.chargerModule).toBeUndefined());

    test('Number of Bucks', () => expect(pmic.getNumberOfBucks()).toBe(0));

    test('Number of LDOs', () => expect(pmic.getNumberOfLdos()).toBe(1));

    test('Number of GPIOs', () => expect(pmic.gpioModule.length).toBe(2));

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(0));

    test('Device Type', () => expect(pmic.getDeviceType()).toBe('npm2100'));

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
            min: 0.8,
            max: 3,
            decimals: 1,
            step: 0.1,
        })
    );

    test('USB Power Current Limiter Range', () =>
        expect(pmic.getUSBCurrentLimiterRange()).toStrictEqual([
            0.1, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5,
        ]));
});

export {};
