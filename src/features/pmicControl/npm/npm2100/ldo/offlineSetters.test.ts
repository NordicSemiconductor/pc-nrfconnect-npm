/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_LDOS, setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 2100 - Setters Offline tests', () => {
    const { mockOnLdoUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_2100_LDOS)('Set setLdoVoltage index: %p', async index => {
        await pmic.ldoModule[index].set.voltage(1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_2100_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.ldoModule[index].set.enabled(false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });
});

export {};
