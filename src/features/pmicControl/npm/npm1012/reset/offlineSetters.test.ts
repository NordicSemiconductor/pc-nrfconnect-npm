/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type ResetConfig } from '../../types';
import { setupMocksBase } from '../tests/helpers';
import { longPressResetPinSelKeys } from './types';

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
        } as ResetConfig);
    });

    test('Set longPressResetEnable', async () => {
        await pmic.resetModule?.set.longPressResetEnable?.(true);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetEnable: true,
        } as ResetConfig);
    });

    test.each(longPressResetPinSelKeys)(
        'Set longPressResetPinSel',
        async pinSel => {
            await pmic.resetModule?.set.longPressResetPinSel?.(pinSel);

            expect(mockOnResetUpdate).toBeCalledTimes(1);
            expect(mockOnResetUpdate).toBeCalledWith({
                longPressResetDebounceSelDisabled: pinSel === 'OFF',
                longPressResetPinSel: pinSel,
            } as ResetConfig);
        },
    );

    test('Set powerDownWait', async () => {
        await pmic.resetModule?.set.powerDownWait?.('250ms');

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            powerDownWait: '250ms',
        } as ResetConfig);
    });
});

export {};
