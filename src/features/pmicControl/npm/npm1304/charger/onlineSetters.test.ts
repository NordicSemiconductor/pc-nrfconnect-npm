/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { NTCThermistor } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Setters Online tests', () => {
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
            await pmic.chargerModule?.set.vTerm(3.2);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_voltage normal set 3200`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerIChg', async () => {
            await pmic.chargerModule?.set.iChg(32);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charging_current set 32000`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTrickleFast', async () => {
            await pmic.chargerModule?.set.vTrickleFast(2.5);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle_voltage set 2500`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerITerm', async () => {
            await pmic.chargerModule?.set.iTerm(10);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger termination_current set 10`,
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
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
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
                    `powerup_charger vbatlow set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test.each([true, false])(
            'Set setChargerEnabled enabled: %p',
            async enabled => {
                await pmic.chargerModule?.set.enabled(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test.each([
            {
                mode: '100 kΩ',
                cliMode: 100000,
                beta: 4250,
            },
            {
                mode: '10 kΩ',
                cliMode: 10000,
                beta: 3380,
            },
            {
                mode: '47 kΩ',
                cliMode: 47000,
                beta: 4050,
            },
        ] as { mode: NTCThermistor; cliMode: number; beta: number }[])(
            'Set setChargerNTCThermistor - auto beta - %p',
            async ({ mode, cliMode, beta }) => {
                await pmic.chargerModule?.set.nTCThermistor(mode, true);

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(4);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    4,
                    `npmx adc ntc beta set ${beta}`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each([
            {
                mode: '100 kΩ',
                cliMode: 100000,
            },
            {
                mode: '10 kΩ',
                cliMode: 10000,
            },
            {
                mode: '47 kΩ',
                cliMode: 47000,
            },
            {
                mode: 'Ignore NTC',
                cliMode: 0,
            },
        ] as { mode: NTCThermistor; cliMode: number; beta: number }[])(
            'Set setChargerNTCThermistor - manual beta %p',
            async ({ mode, cliMode }) => {
                await pmic.chargerModule?.set.nTCThermistor(mode, false);

                // turn off charging
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test('Set setChargerNTCBeta', async () => {
            await pmic.chargerModule?.set.nTCBeta(3380);

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx adc ntc beta set 3380`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTChgResume', async () => {
            await pmic.chargerModule?.set.tChgResume(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp resume set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTChgStop', async () => {
            await pmic.chargerModule?.set.tChgStop(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp stop set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTCold', async () => {
            await pmic.chargerModule?.set.tCold(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature cold set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTCool', async () => {
            await pmic.chargerModule?.set.tCool(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature cool set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTWarm', async () => {
            await pmic.chargerModule?.set.tWarm(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature warm set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerTHot', async () => {
            await pmic.chargerModule?.set.tHot(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature hot set 90`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set chargerVTermR', async () => {
            await pmic.chargerModule?.set.vTermR(3.55);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger termination_voltage warm set 3550`,
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
                pmic.chargerModule?.set.vTerm(3.2),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_voltage normal get`,
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
                pmic.chargerModule?.set.vTerm(3.2),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_voltage normal set 3200`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_voltage normal get`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerIChg onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.iChg(32),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger charging_current get`,
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
                pmic.chargerModule?.set.iChg(32),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charging_current set 32000`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger charging_current get`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerVTrickleFast onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTrickleFast(2.5),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({
                vTrickleFast: 2.5,
            });

            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger trickle_voltage get`,
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

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({
                vTrickleFast: 2.5,
            });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger trickle_voltage set 2500`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger trickle_voltage get`,
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerITerm  onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.iTerm(10),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: 10 });

            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_current get`,
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
                pmic.chargerModule?.set.iTerm(10),
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: 10 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_current set 10`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_current get`,
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

                // turn off recharge
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module recharge get`,
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

                // turn off vbatlow
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `powerup_charger vbatlow set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `powerup_charger vbatlow get`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each([
            {
                mode: '100 kΩ',
                cliMode: '100000',
            },
            {
                mode: '10 kΩ',
                cliMode: '10000',
            },
            {
                mode: '47 kΩ',
                cliMode: '47000',
            },
            {
                mode: 'Ignore NTC',
                cliMode: '0',
            },
        ] as { mode: NTCThermistor; cliMode: string }[])(
            'Set setChargerNTCThermistor - onError case 2 - Fail immediately -  %p',
            async ({ mode, cliMode }) => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess,
                );

                await expect(
                    pmic.chargerModule?.set.nTCThermistor(mode),
                ).rejects.toBeUndefined();

                // turn chance ntc thermistor
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx adc ntc type get`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each(['100 kΩ', '10 kΩ', '47 kΩ'] as NTCThermistor[])(
            'Set setChargerNTCThermistor - Fail immediately - mode: %p',
            async mode => {
                await expect(
                    pmic.chargerModule?.set.nTCThermistor(mode),
                ).rejects.toBeUndefined();

                // turn chance ntc thermistor
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx adc ntc type get`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test('Set setChargerNTCBeta - Fail immediately : %p', async () => {
            await expect(
                pmic.chargerModule?.set.nTCBeta(3380),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test('Set setChargerNTCBeta - Fail immediately case 2: %p', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess,
            );

            await expect(
                pmic.chargerModule?.set.nTCBeta(3380),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx adc ntc beta set 3380',
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npmx adc ntc beta get',
                expect.anything(),
                undefined,
                true,
            );
        });

        test.each([true, false])(
            'Set setChargerEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabled(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npmx charger module charger get',
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setChargerTChgResume - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tChgResume(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger die_temp resume set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger die_temp resume get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTChgStop - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tChgStop(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger die_temp stop set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger die_temp stop get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTCold - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCold(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature cold set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature cold get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTCool - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCool(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature cool set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature cool get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTWarm - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tWarm(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature warm set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature warm get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTHot - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tHot(90),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature hot set 90`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature hot get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerVTermR - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTermR(3.55),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger termination_voltage warm set 3550`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger termination_voltage warm get',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
