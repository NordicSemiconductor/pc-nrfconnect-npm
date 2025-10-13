/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { npm1300TimeToActive, PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnLowPowerUpdate,
        mockEnqueueRequest,
        pmic,
    } = setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set ship config time %p', async () => {
            await pmic.lowPowerModule?.set.timeToActive(
                npm1300TimeToActive['16ms'],
            );

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ship config time set 16`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set setShipModeTimeToActive - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.lowPowerModule?.set.timeToActive(
                    npm1300TimeToActive['16ms'],
                ),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ship config time set 16`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx ship config time get`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
