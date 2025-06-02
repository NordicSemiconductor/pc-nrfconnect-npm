/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog, TimerPrescalerValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';
import { TimerModeValues } from './types';

describe('PMIC 1300 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnTimerConfigUpdate,
        mockEnqueueRequest,
        pmic,
    } = setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test.each(
            TimerModeValues.map((mode, index) => ({
                mode,
                index,
            }))
        )('Set timer config mode %p', async ({ mode, index }) => {
            await pmic.timerConfigModule?.set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx timer config mode set ${index}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });

        test.each(
            TimerPrescalerValues.map((prescaler, index) => ({
                prescaler,
                index,
            }))
        )('Set timer config mode %p', async ({ prescaler, index }) => {
            await pmic.timerConfigModule?.set.prescaler!(prescaler);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx timer config prescaler set ${index}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });

        test('Set timer config compare %p', async () => {
            await pmic.timerConfigModule?.set.period(1000);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx timer config compare set 1000`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test.each(
            TimerModeValues.map((mode, index) => ({
                mode,
                index,
            }))
        )(
            'Set setTimerConfigMode - Fail immediately - index: %p',
            async ({ mode, index }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.timerConfigModule?.set.mode(mode)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx timer config mode set ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx timer config mode get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            TimerPrescalerValues.map((prescaler, index) => ({
                prescaler,
                index,
            }))
        )(
            'Set setTimerConfigMode - Fail immediately - index: %p',
            async ({ prescaler, index }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.timerConfigModule?.set.prescaler!(prescaler)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx timer config prescaler set ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx timer config prescaler get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setTimerConfigMode - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.timerConfigModule?.set.period(1000)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx timer config compare set 1000`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx timer config compare get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
