/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PMIC_1012_BUCKS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnBuckUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(PMIC_1012_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.buckModule[index].set.vOutNormal(1.85);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm1012 buck vout software set 0 1.85V`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnBuckUpdate).toBeCalledTimes(0); // Updates should only be emitted when we get response
        });

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckAlternateVOut index: %p',
            async index => {
                await pmic.buckModule[index].set.alternateVOut?.(1.85);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 buck vout software set 1 1.85V`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)('Set setBuckMode - vSet', async index => {
            await pmic.buckModule[index].set.mode('vSet');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm1012 buck voutselctrl set VSET`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckModeControl index: %p',
            async index => {
                await pmic.buckModule[index].set.modeControl('LP');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 buck pwrmode set LP`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckOnOffControl index: %p',
            async index => {
                await pmic.buckModule[index].set.onOffControl('Software');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 buck enablectrl set SOFTWARE`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckEnabled index: %p',
            async index => {
                await pmic.buckModule[index].set.enabled(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 buck enable set ON`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckEnabled index: %p false',
            async index => {
                await pmic.buckModule[index].set.enabled(false);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 buck enable set OFF`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
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

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.vOutNormal(1.85),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 buck vout software set 0 1.85V`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 buck vout software get 0`, // Request update on error
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckMode - Fail immediately - vSet',
            async index => {
                await expect(
                    pmic.buckModule[index].set.mode('vSet'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 buck voutselctrl set VSET`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 buck voutselctrl get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckModeControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.modeControl('GPIO'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 buck pwrmode set GPIO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 buck pwrmode get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.onOffControl('GPIO'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 buck enablectrl set GPIO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 buck enablectrl get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_BUCKS)(
            'Set setBuckEnabled - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.enabled(true),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 buck enable set ON`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 buck enable get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
