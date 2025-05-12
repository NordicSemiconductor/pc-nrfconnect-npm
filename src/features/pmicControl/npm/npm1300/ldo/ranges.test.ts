/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_LDOS, setupMocksBase } from '../tests/helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of LDOs', () => expect(pmic.ldoModule.length).toBe(2));

    test.each(PMIC_1300_LDOS)('LDO Voltage Range index: %p', index =>
        expect(pmic.ldoModule[index].ranges.voltage).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        })
    );
});

export {};
