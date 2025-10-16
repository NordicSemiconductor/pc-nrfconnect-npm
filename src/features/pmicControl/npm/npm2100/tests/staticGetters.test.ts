/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from './helpers';

describe('PMIC 2100 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Has of Charger', () => expect(pmic.chargerModule).toBeUndefined());

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(0));

    test('Device Type', () => expect(pmic.deviceType).toBe('npm2100'));
});

export {};
