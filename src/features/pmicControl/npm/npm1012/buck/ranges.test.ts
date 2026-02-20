/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_BUCKS, setupMocksBase } from '../tests/helpers';

describe('PMIC 1012 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of Bucks', () => expect(pmic.buckModule.length).toBe(1));

    test.each(PMIC_1012_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.voltage).toStrictEqual({
            decimals: 2,
            max: 3.3,
            min: 1,
            step: 0.05,
        }),
    );

    test.each(PMIC_1012_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.alternateVOut).toStrictEqual({
            decimals: 2,
            max: 3.3,
            min: 1,
            step: 0.05,
        }),
    );
});

export {};
