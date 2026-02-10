/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type FuelGauge } from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1304 - Setters Offline tests', () => {
    const { mockOnFuelGaugeUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set setFuelGaugeEnabled', async () => {
        await pmic.fuelGaugeModule?.set.enabled(false);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith({
            enabled: false,
        } satisfies Partial<FuelGauge>);
    });
});

export {};
