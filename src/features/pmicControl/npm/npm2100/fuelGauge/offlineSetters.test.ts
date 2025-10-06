/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { FuelGauge, PmicDialog } from '../../types';
import { setupMocksBase } from '../tests/helpers';

describe('PMIC 2100 - Setters Offline tests', () => {
    const { mockDialogHandler, mockOnFuelGaugeUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([true, false])(
        'Set setFuelGuageEnable index: %p',
        async enabled => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.fuelGaugeModule?.set.enabled(enabled);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith({
                enabled,
            } satisfies Partial<FuelGauge>);
        }
    );
});

export {};
