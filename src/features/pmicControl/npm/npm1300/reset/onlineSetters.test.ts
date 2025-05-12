/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../types';
import { helpers, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnResetUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test('Set ship reset longpress two_button', async () => {
            await pmic.resetModule?.set.longPressReset?.('two_button');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_ship longpress set two_button`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test('Set setShipLongPressReset - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.resetModule?.set.longPressReset?.('one_button')
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_ship longpress set one_button`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `powerup_ship longpress get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
