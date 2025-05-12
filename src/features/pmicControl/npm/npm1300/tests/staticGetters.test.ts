/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from './helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(3));

    test('Device Type', () => expect(pmic.deviceType).toBe('npm1300'));
});

export {};
