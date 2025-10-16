/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { FuelGauge } from '../../types';
import { setupMocksBase } from '../tests/helpers';

describe('PMIC 2100 - Setters Offline tests', () => {
    const { mockOnFuelGaugeUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([true, false])(
        'Set setFuelGaugeEnable index: %p',
        async enabled => {
            await pmic.fuelGaugeModule?.set.enabled(enabled);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith({
                enabled,
            } satisfies Partial<FuelGauge>);
        },
    );
});

export {};
