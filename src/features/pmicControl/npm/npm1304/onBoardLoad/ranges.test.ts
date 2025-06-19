/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of LDOs', () => expect(pmic.ldoModule.length).toBe(2));

    test('LDO Voltage Range index: %p', () =>
        expect(pmic.onBoardLoadModule?.ranges.iLoad).toStrictEqual({
            min: 0,
            max: 99,
            decimals: 2,
            step: 0.01,
        }));
});

export {};
