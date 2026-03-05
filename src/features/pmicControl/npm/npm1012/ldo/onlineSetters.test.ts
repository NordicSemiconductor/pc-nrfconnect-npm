/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PMIC_1012_LDOS, setupMocksWithShellParser } from '../tests/helpers';
import { onOffControlValues } from './types';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnLdoUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(PMIC_1012_LDOS)(
            'Set setLdoVoltage index: %p',
            async index => {
                await pmic.ldoModule[index].set.voltage?.(1.5);

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 ldosw mode set ${index} LDO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw vout software set ${index} 1.5`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.enabled(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw enable set ${index} ${enabled ? 'on' : 'off'}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1012_LDOS)('Set setLdoMode index: %p', async index => {
            await pmic.ldoModule[index].set.mode?.('Load_switch');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw mode set ${index} Load_switch`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoSoftStart %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.softStart?.(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstart set ${index} ${enabled ? 'on' : 'off'}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1012_LDOS)(
            'Set setLdoSoftStartCurrentLimit index: %p',
            async index => {
                await pmic.ldoModule[index].set.softStartCurrent?.(20, 'LDO');
                await pmic.ldoModule[index].set.softStartCurrent?.(
                    20,
                    'Load_switch',
                );

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstartilim set ${index} 20`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstartilim set ${index} 20`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)(
            'Set setLdoSoftStartTime index: %p',
            async index => {
                await pmic.ldoModule[index].set.softStartTime?.(4.5);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstarttime set ${index} 4.5`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoOvercurrentProtection %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.overcurrentProtection?.(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw ocp set ${index} ${enabled ? 'on' : 'off'}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1012_LDOS.map(index =>
                onOffControlValues.map(onOffControl => ({
                    index,
                    onOffControl,
                })),
            ).flat(),
        )('Set setLdoOnOffControl %p', async ({ index, onOffControl }) => {
            await pmic.ldoModule[index].set.onOffControl?.(onOffControl);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw enablectrl set ${index} ${onOffControl}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.ldoModule[index].set.activeDischarge?.(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw activedischarge set ${index} ${
                    enabled ? 'on' : 'off'
                }`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(PMIC_1012_LDOS)(
            'Set setLdoVoltage onError case 1  - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.voltage?.(1.5),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 ldosw mode set ${index} LDO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npm1012 ldosw vout software get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)(
            'Set setLdoVoltage onError case 2  - Fail on second command  - index: %p',
            async index => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess,
                );

                await expect(
                    pmic.ldoModule[index].set.voltage?.(1.5),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 ldosw mode set ${index} LDO`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw vout software set ${index} 1.5`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Request update on error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npm1012 ldosw vout software get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1012_LDOS.map(index =>
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
                    `npm1012 ldosw enable set ${index} ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw enable get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)('Set setLdoMode index: %p', async index => {
            await expect(
                pmic.ldoModule[index].set.mode?.('Load_switch'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw mode set ${index} Load_switch`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm1012 ldosw mode get ${index}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                })),
            ).flat(),
        )(
            'Set setLdoSoftStart - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.ldoModule[index].set.softStart?.(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstart set ${index} ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw softstart get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)(
            'Set setLdoSoftStartCurrentLimit index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.softStartCurrent?.(20, 'LDO'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstartilim set ${index} 20`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw softstartilim get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)(
            'Set setLdoSoftStartTime index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.softStartTime?.(4.5),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw softstarttime set ${index} 4.5`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw softstarttime get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(activeDischarge => ({
                    index,
                    activeDischarge,
                })),
            ).flat(),
        )(
            'Set setLdoActiveDischarge - Fail immediately - %p',
            async ({ index, activeDischarge }) => {
                await expect(
                    pmic.ldoModule[index].set.activeDischarge?.(
                        activeDischarge,
                    ),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw activedischarge set ${index} ${
                        activeDischarge ? 'on' : 'off'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw activedischarge get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_1012_LDOS.map(index =>
                [true, false].map(ocp => ({
                    index,
                    ocp,
                })),
            ).flat(),
        )(
            'Set setLdoOvercurrentProtection - Fail immediately - %p',
            async ({ index, ocp }) => {
                await expect(
                    pmic.ldoModule[index].set.overcurrentProtection?.(ocp),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 ldosw ocp set ${index} ${ocp ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw ocp get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LDOS)(
            'Set setLdoOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.ldoModule[index].set.onOffControl?.('Software'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 ldosw enablectrl set ${index} Software`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1012 ldosw enablectrl get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
