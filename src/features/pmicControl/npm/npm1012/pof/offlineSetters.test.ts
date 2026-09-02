/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnPOFUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set pof resetThreshold', async () => {
        await pmic.pofModule?.set.resetThreshold(2.55);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ resetThreshold: 2.55 });
    });

    test('Set pof warnThreshold', async () => {
        await pmic.pofModule?.set.warnThreshold?.(2.55);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ warnThreshold: 2.55 });
    });
});

export {};
