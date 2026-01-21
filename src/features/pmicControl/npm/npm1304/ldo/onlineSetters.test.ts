/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SoftStartValues } from '../../npm1300/ldo/types';
import { helpers } from '../../tests/helpers';
import { type PmicDialog } from '../../types';
import { PMIC_1304_LDOS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnLdoUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(PMIC_1304_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await pmic.ldoModule[index].set.voltage(1);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw ldo_voltage set ${index} ${1000}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.enabled(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw status set ${index} ${enabled ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1304_LDOS.map(index => [
                {
                    index,
                    mode: 0,
                },
                {
                    index,
                    mode: 1,
                },
            ]).flat(),
        )('Set setLdoMode index: %p', async ({ index, mode }) => {
            if (mode === 1)
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

            await pmic.ldoModule[index].set.mode(
                mode === 0 ? 'Load_switch' : 'LDO',
            );

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw mode set ${index} ${mode}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1304_LDOS)(
            'Set setLdoMode index: %p - confirm',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );
                await pmic.ldoModule[index].set.mode('LDO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1304_LDOS)(
            "Set setLdoMode index: %p - Yes, Don' ask again",
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        if (dialog.onOptional) dialog.onOptional();
                    },
                );
                await pmic.ldoModule[index].set.mode('LDO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1304_LDOS)(
            'Set setLdoMode index: %p - Cancel',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onCancel?.();
                    },
                );
                await expect(
                    pmic.ldoModule[index].set.mode('LDO'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(0);
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoSoftStart %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.softStartEnabled?.(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start enable set ${index} ${
                    enabled ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1304_LDOS.map(index =>
                SoftStartValues.map(softStart => ({
                    index,
                    softStart,
                })),
            ).flat(),
        )('Set setLdoSoftStart %p', async ({ index, softStart }) => {
            await pmic.ldoModule[index].set.softStart?.(softStart);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start current set ${index} ${softStart}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.activeDischarge?.(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw active_discharge set ${index} ${
                    enabled ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1304_LDOS)(
            'Set setLdoOnOffControl index: %p',
            async index => {
                await pmic.ldoModule[index].set.onOffControl?.('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw gpio index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(PMIC_1304_LDOS)(
            'Set setLdoVoltage onError case 1  - Fail immediately - index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await expect(
                    pmic.ldoModule[index].set.voltage(3),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(PMIC_1304_LDOS)(
            'Set setLdoVoltage onError case 2  - Fail immediately - index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess,
                );

                await expect(
                    pmic.ldoModule[index].set.voltage(3),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw mode set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw ldo_voltage set ${index} 3000`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.ldoModule[index].set.enabled(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw status set ${index} ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw status get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index => [
                {
                    index,
                    mode: 0,
                },
                {
                    index,
                    mode: 1,
                },
            ]).flat(),
        )(
            'Set setLdoMode - Fail immediately - index: %p',
            async ({ index, mode }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await expect(
                    pmic.ldoModule[index].set.mode(
                        mode === 0 ? 'Load_switch' : 'LDO',
                    ),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw mode set ${index} ${mode}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )(
            'Set setLdoSoftStartEnabled - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.ldoModule[index].set.softStartEnabled?.(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw soft_start enable set ${index} ${
                        enabled ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw soft_start enable get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                SoftStartValues.map(softStart => ({
                    index,
                    softStart,
                })),
            ).flat(),
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, softStart }) => {
                await expect(
                    pmic.ldoModule[index].set.softStart?.(softStart),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw soft_start current set ${index} ${softStart}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw soft_start current get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1304_LDOS.map(index =>
                [true, false].map(activeDischarge => ({
                    index,
                    activeDischarge,
                })),
            ).flat(),
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, activeDischarge }) => {
                await expect(
                    pmic.ldoModule[index].set.activeDischarge?.(
                        activeDischarge,
                    ),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw active_discharge set ${index} ${
                        activeDischarge ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw active_discharge get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1304_LDOS)(
            'Set setLdoOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.onOffControl?.('GPIO2'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw gpio index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw gpio index get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
