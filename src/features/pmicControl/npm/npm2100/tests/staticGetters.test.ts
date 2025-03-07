/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_LDOS, setupMocksBase } from './helpers';

describe('PMIC 2100 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(pmic.chargerModule).toBeUndefined());

    test('Number of LDOs', () => expect(pmic.ldoModule.length).toBe(1));

    test('Number of GPIOs', () => expect(pmic.gpioModule.length).toBe(2));

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(0));

    test('Device Type', () => expect(pmic.deviceType).toBe('npm2100'));

    test.each(PMIC_2100_LDOS)('LDO Voltage Range index: %p', index =>
        expect(pmic.ldoModule[index].ranges.voltage).toStrictEqual({
            min: 0.8,
            max: 3,
            decimals: 1,
            step: 0.1,
        })
    );
});

export {};
