/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnResetUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set longPressResetDebounce', async () => {
            await pmic.resetModule?.set.longPressResetDebounce?.('20s');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl long_press_reset debounce set 20s',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set longPressResetEnable', async () => {
            await pmic.resetModule?.set.longPressResetEnable?.(true);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl long_press_reset enable set on',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set longPressResetPinSel', async () => {
            await pmic.resetModule?.set.longPressResetPinSel?.('SHPHLD');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl long_press_reset pinsel set SHPHLD',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set powerDownWait', async () => {
            await pmic.resetModule?.set.powerDownWait?.('150ms');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl powerdown_wait set 150ms',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set longPressResetDebounce - Fail immediately', async () => {
            await expect(
                pmic.resetModule?.set.longPressResetDebounce?.('10s'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 reset_ctrl long_press_reset debounce set 10s',
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl long_press_reset debounce get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set longPressResetEnable - Fail immediately', async () => {
            await expect(
                pmic.resetModule?.set.longPressResetEnable?.(true),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 reset_ctrl long_press_reset enable set on',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl long_press_reset enable get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set longPressResetPinSel - Fail immediately', async () => {
            await expect(
                pmic.resetModule?.set.longPressResetPinSel?.('SHPHLD'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 reset_ctrl long_press_reset pinsel set SHPHLD',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl long_press_reset pinsel get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test('Set powerDownWait - Fail immediately', async () => {
            await expect(
                pmic.resetModule?.set.powerDownWait?.('150ms'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 reset_ctrl powerdown_wait set 150ms',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl powerdown_wait get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
