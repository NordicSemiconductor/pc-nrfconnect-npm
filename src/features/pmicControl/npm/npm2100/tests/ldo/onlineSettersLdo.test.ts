/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../../tests/helpers';
import { LdoMode, PmicDialog } from '../../../types';
import { PMIC_2100_LDOS, setupMocksWithShellParser } from '../helpers';

describe('PMIC 2100 - Setters Online tests - LDO', () => {
    const { mockDialogHandler, mockOnLdoUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });
        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await pmic.ldoModule[index].set.voltage(1);

                expect(mockEnqueueRequest).toBeCalledTimes(3);

                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm2100 ldosw enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw mode set LDO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npm2100 ldosw vout set ${1000}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(
            PMIC_2100_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.enabled(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 ldosw enable set ${enabled ? 'ON' : 'OFF'}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_LDOS.map(index => [
                {
                    index,
                    mode: 'Load_switch' as LdoMode,
                },
                {
                    index,
                    mode: 'LDO' as LdoMode,
                },
            ]).flat(),
        )('Set setLdoMode index: %p', async ({ index, mode }) => {
            await pmic.ldoModule[index].set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm2100 ldosw enable set OFF`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 ldosw mode set ${mode}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        //
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage onError case 1  - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.voltage(3),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm2100 ldosw enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw enable get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(PMIC_2100_LDOS)(
            'Set setLdoVoltage onError case 2  - Fail immediately - index: %p',
            async index => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                // Mock success on set enable and set mode
                mockEnqueueRequest
                    .mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess,
                    )
                    .mockImplementationOnce(
                        helpers.registerCommandCallbackSuccess,
                    );

                await expect(
                    pmic.ldoModule[index].set.voltage(3),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(4);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm2100 ldosw enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw mode set LDO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npm2100 ldosw vout set 3000`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    4,
                    `npm2100 ldosw vout get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
            },
        );

        test.each(
            PMIC_2100_LDOS.map(index =>
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
                    `npm2100 ldosw enable set ${enabled ? 'ON' : 'OFF'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw enable get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_LDOS.map(index => [
                {
                    index,
                    mode: 'Load_switch' as LdoMode,
                },
                {
                    index,
                    mode: 'LDO' as LdoMode,
                },
            ]),
        )(
            'Set setLdoMode - Fail immediately - index: %p',
            async ({ index, mode }) => {
                await expect(
                    pmic.ldoModule[index].set.mode(mode),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 ldosw enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw enable get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_LDOS.map(index => [
                {
                    index,
                    mode: 'Load_switch' as LdoMode,
                },
                {
                    index,
                    mode: 'LDO' as LdoMode,
                },
            ]),
        )(
            'Set setLdoMode - Succeed setting enable, fail setting mode - index: %p',
            async ({ index, mode }) => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess,
                );

                await expect(
                    pmic.ldoModule[index].set.mode(mode),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 ldosw enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 ldosw mode set ${mode}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npm2100 ldosw mode get`,
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
