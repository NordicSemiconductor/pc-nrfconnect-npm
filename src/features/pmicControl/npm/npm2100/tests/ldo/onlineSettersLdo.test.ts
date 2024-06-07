/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../../types';
import { helpers, PMIC_2100_LDOS, setupMocksWithShellParser } from '../helpers';

test.skip('PMIC 2100 - Setters Online tests - LDO', () => {
    const { mockDialogHandler, mockOnLdoUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });
        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await pmic.setLdoVoltage(index, 1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw ldo_voltage set ${index} ${1000}`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            }
        );

        test.each(
            PMIC_2100_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                }))
            ).flat()
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.setLdoEnabled(index, enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw status set ${index} ${enabled ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_LDOS.map(index => [
                {
                    index,
                    mode: 0,
                },
                {
                    index,
                    mode: 1,
                },
            ]).flat()
        )('Set setLdoMode index: %p', async ({ index, mode }) => {
            if (mode === 1)
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

            await pmic.setLdoMode(index, mode === 0 ? 'load_switch' : 'LDO');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw mode set ${index} ${mode}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_2100_LDOS)(
            'Set setLdoMode index: %p - confirm',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );
                await pmic.setLdoMode(index, 'LDO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_2100_LDOS)(
            "Set setLdoMode index: %p - Yes, Don' ask again",
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        if (dialog.onOptional) dialog.onOptional();
                    }
                );
                await pmic.setLdoMode(index, 'LDO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_2100_LDOS)(
            'Set setLdoMode index: %p - Cancel',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onCancel();
                    }
                );
                await expect(
                    pmic.setLdoMode(index, 'LDO')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(0);
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        //
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });
        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage onError case 1  - Fail immediately - index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setLdoVoltage(index, 3)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            }
        );

        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage onError case 2  - Fail immediately - index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.setLdoVoltage(index, 3)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw ldo_voltage set ${index} 3000`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            }
        );

        test.each(
            PMIC_2100_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                }))
            ).flat()
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.setLdoEnabled(index, enabled)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw status set ${index} ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw status get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_2100_LDOS.map(index => [
                {
                    index,
                    mode: 0,
                },
                {
                    index,
                    mode: 1,
                },
            ]).flat()
        )(
            'Set setLdoMode - Fail immediately - index: %p',
            async ({ index, mode }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setLdoMode(index, mode === 0 ? 'load_switch' : 'LDO')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} ${mode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );
    });
});
