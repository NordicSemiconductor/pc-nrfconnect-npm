/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

describe('PMIC 1304 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('Number of GPIOs', () => expect(pmic.gpioModule.length).toBe(5));
});

export {};
