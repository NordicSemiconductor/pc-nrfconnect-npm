/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnResetUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set longPressResetDebounce', async () => {
        await pmic.resetModule?.set.longPressResetDebounce?.('10s');

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetDebounce: '10s',
        });
    });

    test('Set longPressResetEnable', async () => {
        await pmic.resetModule?.set.longPressResetEnable?.(true);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetEnable: true,
        });
    });

    test('Set longPressResetPinSel', async () => {
        await pmic.resetModule?.set.longPressResetPinSel?.('OFF');

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetPinSel: 'OFF',
        });
    });

    test('Set powerDownWait', async () => {
        await pmic.resetModule?.set.powerDownWait?.('250ms');

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            powerDownWait: '250ms',
        });
    });
});

export {};
