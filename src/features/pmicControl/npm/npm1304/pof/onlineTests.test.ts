/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog, POFPolarityValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnPOFUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each([true, false])('Set pof enable %p', async enable => {
            await pmic.pofModule?.set.enabled(enable);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof status set ${enable ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test('Set pof threshold', async () => {
            await pmic.pofModule?.set.threshold(3);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof threshold set 3000`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test.each(
            POFPolarityValues.map((polarity, index) => ({ polarity, index })),
        )('Set pof polarity %p', async ({ polarity, index }) => {
            await pmic.pofModule?.set.polarity(polarity);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof polarity set ${index}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
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

        test.each([true, false])(
            'Set setPOFEnable - Fail immediately - index: %p',
            async enable => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await expect(
                    pmic.pofModule?.set.enabled(enable),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx pof status set ${enable ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx pof status get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnPOFUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            POFPolarityValues.map((polarity, index) => ({ polarity, index })),
        )(
            'Set setPOFPolarity - Fail immediately - index: %p',
            async ({ polarity, index }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await expect(
                    pmic.pofModule?.set.polarity(polarity),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx pof polarity set ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx pof polarity get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnPOFUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setPOFThreshold - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.pofModule?.set.threshold(2.7),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof threshold set 2700`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx pof threshold get`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
