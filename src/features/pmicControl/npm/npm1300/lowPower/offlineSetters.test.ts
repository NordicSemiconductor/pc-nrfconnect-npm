/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm1300TimeToActive } from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const { mockOnLowPowerUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set set timer config time ', async () => {
        await pmic.lowPowerModule?.set.timeToActive(
            npm1300TimeToActive['16ms']
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({ timeToActive: '16' });
    });
});

export {};
