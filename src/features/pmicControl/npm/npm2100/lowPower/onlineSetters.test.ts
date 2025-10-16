/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Setters Online tests', () => {
    const { mockDialogHandler, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test('enterBreakToWake - onConfirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm2100 low_power_control pwr_btn set OFF`,
                    expect.anything(),
                    undefined,
                    true
                );
                dialog.onConfirm();
            });

            await pmic.lowPowerModule?.actions.enterBreakToWake?.();

            expect(mockEnqueueRequest).toBeCalledTimes(5);
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 low_power_control ship_mode_configure resistor set NONE`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npm2100 low_power_control wakeup_configure edge_polarity set RISING`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                4,
                `npm2100 low_power_control ship_mode_configure current set LOW`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                5,
                `npm2100 low_power_control ship_mode set ENABLE`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('enterBreakToWake - onCancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm2100 low_power_control pwr_btn set OFF`,
                    expect.anything(),
                    undefined,
                    true
                );

                dialog.onCancel?.();
            });

            await pmic.lowPowerModule?.actions.enterBreakToWake?.();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 low_power_control pwr_btn set ON`,
                expect.anything(),
                undefined,
                true
            );
        });
    });
});

export {};
