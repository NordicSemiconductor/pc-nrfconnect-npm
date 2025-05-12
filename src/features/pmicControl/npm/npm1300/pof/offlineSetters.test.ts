/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const { mockOnPOFUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set set pof enable ', async () => {
        await pmic.pofModule?.set.enabled(true);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ enable: true });
    });

    test('Set set pof polarity ', async () => {
        await pmic.pofModule?.set.polarity('Active low');

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ polarity: 'Active low' });
    });
});

export {};
