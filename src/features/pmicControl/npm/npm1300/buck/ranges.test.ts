/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_BUCKS, setupMocksBase } from '../tests/helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of Bucks', () => expect(pmic.buckModule.length).toBe(2));

    test.each(PMIC_1300_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.voltage).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
        })
    );

    test.each(PMIC_1300_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.retVOut).toStrictEqual({
            min: 1,
            max: 3,
            decimals: 1,
        })
    );
});

export {};
