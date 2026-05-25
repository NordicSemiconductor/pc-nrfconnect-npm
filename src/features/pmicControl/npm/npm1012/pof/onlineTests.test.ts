/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { type PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnPOFUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set pof resetThreshold', async () => {
            await pmic.pofModule?.set.resetThreshold(2.55);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl pof reset_threshold set 2.55V',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test('Set pof warnThreshold', async () => {
            await pmic.pofModule?.set.warnThreshold?.(2.55);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl pof warn_threshold set 2.55V',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set pof resetThreshold - Fail immediately:', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.pofModule?.set.resetThreshold(2.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl pof reset_threshold set 2.55V',
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl pof reset_threshold get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test('Set pof warnThreshold - Fail immediately:', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.pofModule?.set.warnThreshold?.(2.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 reset_ctrl pof warn_threshold set 2.55V',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 reset_ctrl pof warn_threshold get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
