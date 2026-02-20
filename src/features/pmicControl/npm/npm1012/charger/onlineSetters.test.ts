/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnChargerUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set setChargerVTerm', async () => {
            await pmic.chargerModule?.set.vTerm(3.55);

            // Expect charger to be turned off before changing the voltage
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger voltage termination set 3.55',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerIChg', async () => {
            await pmic.chargerModule?.set.iChg(1.5);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger current charge set 1.5',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTrickleFast', async () => {
            await pmic.chargerModule?.set.vTrickleFast(2.5);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger voltage trickle set 2.5',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerITerm', async () => {
            await pmic.chargerModule?.set.iTerm(3.125);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger current termination set 3.125',
                expect.anything(),
                undefined,
                true,
            );
        });

        test.each([true, false])(
            'Set setChargerEnabledRecharging enabled: %p',
            async enabled => {
                await pmic.chargerModule?.set.enabledRecharging(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 charger recharge set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test.each([true, false])(
            'Set setChargerEnabledVBatLow enabled: %p',
            async enabled => {
                await pmic.chargerModule?.set.enabledVBatLow(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 charger lowbat_charging set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test.each([true, false])(
            'Set setChargerEnabled enabled: %p',
            async enabled => {
                await pmic.chargerModule?.set.enabled(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 charger enable set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setChargerTChgReduce', async () => {
            await pmic.chargerModule?.set.tChgReduce?.(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger dietemp reduce set 90',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTChgResume', async () => {
            await pmic.chargerModule?.set.tChgResume(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger dietemp resume set 90',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTCold', async () => {
            await pmic.chargerModule?.set.tCold(-20);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger ntc cold set -20',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTCool', async () => {
            await pmic.chargerModule?.set.tCool(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger ntc cool set 90',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTWarm', async () => {
            await pmic.chargerModule?.set.tWarm(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger ntc warm set 90',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTHot', async () => {
            await pmic.chargerModule?.set.tHot(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 charger ntc hot set 90',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set chargerVTermCool', async () => {
            await pmic.chargerModule?.set.vTermCool?.(3.55);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 charger voltage termination_cool set 3.55`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set chargerVTermWarm', async () => {
            await pmic.chargerModule?.set.vTermWarm?.(3.55);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 charger voltage termination_warm set 3.55`,
                expect.anything(),
                undefined,
                true,
            );
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set setChargerVTerm onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTerm(3.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger enable get',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger voltage termination get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTerm onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess,
            );

            await expect(
                pmic.chargerModule?.set.vTerm(3.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger voltage termination set 3.55',
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error from the second command
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger voltage termination get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerIChg onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.iChg(1.5),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger enable get',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npm1012 charger current charge get`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerIChg onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess,
            );

            await expect(
                pmic.chargerModule?.set.iChg(1.5),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger current charge set 1.5',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger current charge get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTrickleFast onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTrickleFast(2.5),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger enable get',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger voltage trickle get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTrickleFast onError case 2 - Fail immediately', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess,
            );

            await expect(
                pmic.chargerModule?.set.vTrickleFast(2.5),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger voltage trickle set 2.5',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger voltage trickle get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerITerm  onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.iTerm(3.125),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger enable get',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger current termination get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerITerm  onError case 2 - Fail immediately', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess,
            );

            await expect(
                pmic.chargerModule?.set.iTerm(3.125),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger enable set off',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger current termination set 3.125',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npm1012 charger current termination get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test.each([true, false])(
            'Set setChargerEnabledRecharging - Fail immediately -  enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabledRecharging(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 charger recharge set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 charger recharge get',
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each([true, false])(
            'Set setChargerEnableVBatLow - Fail immediately -  enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabledVBatLow(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 charger lowbat_charging set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 charger lowbat_charging get',
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each([true, false])(
            'Set setChargerEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabled(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npm1012 charger enable set ${enabled ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 charger enable get',
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setChargerTChgReduce - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tChgReduce?.(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm1012 charger dietemp reduce set 90`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger dietemp reduce get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTChgResume - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tChgResume(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm1012 charger dietemp resume set 90`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger dietemp resume get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTCold - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCold(-20),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm1012 charger ntc cold set -20`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger ntc cold get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTCool - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCool(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger ntc cool set 90',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger ntc cool get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTWarm - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tWarm(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger ntc warm set 90',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger ntc warm get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTHot - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tHot(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger ntc hot set 90',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger ntc hot get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerVTermWarm - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTermWarm?.(3.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 charger voltage termination_warm set 3.55',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 charger voltage termination_warm get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
