/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const { mockEnqueueRequest, mockOnUsbPower, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test('Set vBusinCurrentLimiter', async () => {
            await pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(5);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx vbusin current_limit set 5000`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnUsbPower).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test('Set vBusinCurrentLimiter - Fail immediately', async () => {
            await expect(
                pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(5)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx vbusin current_limit set 5000`,
                expect.anything(),
                undefined,
                true
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx vbusin current_limit get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnUsbPower).toBeCalledTimes(0);
        });
    });
});

export {};
