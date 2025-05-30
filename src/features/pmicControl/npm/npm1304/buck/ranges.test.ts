/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1304_BUCKS, setupMocksBase } from '../tests/helpers';

describe('PMIC 1304 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of Bucks', () => expect(pmic.buckModule.length).toBe(2));

    test.each(PMIC_1304_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.voltage).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
        })
    );

    test.each(PMIC_1304_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.retVOut).toStrictEqual({
            min: 1,
            max: 3,
            decimals: 1,
        })
    );
});

export {};
