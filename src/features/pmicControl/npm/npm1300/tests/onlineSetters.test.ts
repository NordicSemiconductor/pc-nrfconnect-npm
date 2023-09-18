/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    GPIODriveValues,
    GPIOModeValues,
    GPIOPullValues,
    NTCThermistor,
    PmicDialog,
} from '../../types';
import {
    helpers,
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnActiveBatteryModelUpdate,
        mockOnBuckUpdate,
        mockOnChargerUpdate,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
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
        test('Set setChargerVTerm', async () => {
            await pmic.setChargerVTerm(3.2);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_voltage normal set 3200`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerIChg', async () => {
            await pmic.setChargerIChg(32);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charger_current set 32`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTrickleFast', async () => {
            await pmic.setChargerVTrickleFast(2.5);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerITerm', async () => {
            await pmic.setChargerITerm('10%');

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger termination_current set 10`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.each([true, false])(
            'Set setChargerEnabledRecharging enabled: %p',
            async enabled => {
                await pmic.setChargerEnabledRecharging(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            }
        );

        test.each([true, false])(
            'Set setChargerEnabled enabled: %p',
            async enabled => {
                await pmic.setChargerEnabled(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            }
        );

        test.each([
            {
                mode: '100 kΩ',
                cliMode: 'ntc_100k',
            },
            {
                mode: '10 kΩ',
                cliMode: 'ntc_10k',
            },
            {
                mode: '47 kΩ',
                cliMode: 'ntc_47k',
            },
            {
                mode: 'HI Z',
                cliMode: 'ntc_hi_z',
            },
        ] as { mode: NTCThermistor; cliMode: string }[])(
            'Set setChargerNTCThermistor %p',
            async ({ mode, cliMode }) => {
                await pmic.setChargerNTCThermistor(mode);

                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx adc ntc set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test('Set setChargerTChgResume', async () => {
            await pmic.setChargerTChgResume(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp resume set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTChgStop', async () => {
            await pmic.setChargerTChgStop(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp stop set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.skip('Set setChargerTCold', async () => {
            await pmic.setChargerTCold(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.skip('Set setChargerTCool', async () => {
            await pmic.setChargerTCool(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.skip('Set setChargerTWarm', async () => {
            await pmic.setChargerTWarm(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.skip('Set setChargerTHot', async () => {
            await pmic.setChargerTHot(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set chargerVTermR', async () => {
            await pmic.setChargerVTermR(3.55);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger termination_voltage warm set 3550`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.skip('Set setChargerCurrentCool', async () => {
            await pmic.setChargerCurrentCool('iCHG');

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.setBuckVOutNormal(index, 1.8);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set ${index} 1800`,
                expect.anything(),
                undefined,
                true
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout select set ${index} 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckVOut index: 1 with warning - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel();
            });

            await expect(
                pmic.setBuckVOutNormal(1, 1.6)
            ).rejects.toBeUndefined();

            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckVOut index: 1 with warning - confirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.setBuckVOutNormal(1, 1.6);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set 1 1600`,
                expect.anything(),
                undefined,
                true
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout select set 1 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckVOut index: 1 with warning - yes, don't ask", async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog?.onOptional) dialog.onOptional();
            });

            await pmic.setBuckVOutNormal(1, 1.6);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set 1 1600`,
                expect.anything(),
                undefined,
                true
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout select set 1 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionVOut index: %p',
            async index => {
                await pmic.setBuckVOutRetention(index, 1.8);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck voltage retention set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)('Set setBuckMode - vSet', async index => {
            await pmic.setBuckMode(index, 'vSet');

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout select set ${index} 0`,
                expect.anything(),
                undefined,
                true
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get ${index}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckMode index: 1 with software - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel();
            });

            await expect(
                pmic.setBuckMode(1, 'software')
            ).rejects.toBeUndefined();

            expect(mockDialogHandler).toBeCalledTimes(1);

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckMode index: 1 with software - confirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.setBuckMode(1, 'software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout select set 1 1`,
                expect.anything(),
                undefined,
                true
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckMode index: 1 with software - yes, don't ask", async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog.onOptional) dialog.onOptional();
            });

            await pmic.setBuckMode(1, 'software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout select set 1 1`,
                expect.anything(),
                undefined,
                true
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckModeControl index: %p',
            async index => {
                await pmic.setBuckModeControl(index, 'GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio pwm_force set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckOnOffControl index: %p',
            async index => {
                await pmic.setBuckOnOffControl(index, 'GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio on_off set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionControl index: %p',
            async index => {
                await pmic.setBuckRetentionControl(index, 'GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio retention set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckEnabled index: %p',
            async index => {
                await pmic.setBuckEnabled(index, true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setBuckEnabled index: 1 false - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel();
            });

            await expect(pmic.setBuckEnabled(1, false)).rejects.toBeUndefined();
            expect(mockDialogHandler).toBeCalledTimes(1);

            // No need to request UI update
            expect(mockEnqueueRequest).toBeCalledTimes(0);

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckEnabled index: 1 false -  yes, don't ask", async () => {
            mockEnqueueRequest.mockClear();

            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.setBuckEnabled(1, false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck set 1 0`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckEnabled index: 1 false - confirm', async () => {
            mockEnqueueRequest.mockClear();

            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog.onOptional) dialog.onOptional();
            });

            await pmic.setBuckEnabled(1, false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck set 1 0`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_LDOS)(
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
            PMIC_1300_LDOS.map(index => [
                {
                    index,
                    enabled: false,
                },
                {
                    index,
                    enabled: true,
                },
            ]).flat()
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.setLdoEnabled(index, enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_LDOS.map(index => [
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

            await pmic.setLdoMode(index, mode === 0 ? 'ldoSwitch' : 'LDO');

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

        test.each(PMIC_1300_LDOS)(
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

        test.each(PMIC_1300_LDOS)(
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

        test.each(PMIC_1300_LDOS)(
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

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIOModeValues.map((mode, modeIndex) => ({
                    index,
                    mode,
                    modeIndex,
                }))
            ).flat()
        )('Set setGpioMode index: %p', async ({ index, mode, modeIndex }) => {
            await pmic.setGpioMode(index, mode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio mode set ${index} ${modeIndex}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIOPullValues.map((pull, pullIndex) => ({
                    index,
                    pull,
                    pullIndex,
                }))
            ).flat()
        )('Set setGpioPull index: %p', async ({ index, pull, pullIndex }) => {
            await pmic.setGpioPull(index, pull);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio pull set ${index} ${pullIndex}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                }))
            ).flat()
        )('Set setGpioDrive index: %p', async ({ index, drive }) => {
            await pmic.setGpioDrive(index, drive);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio drive set ${index} ${drive}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                }))
            ).flat()
        )('Set setGpioDebounce index: %p', async ({ index, debounce }) => {
            await pmic.setGpioDebounce(index, debounce);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio debounce set ${index} ${debounce ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                }))
            ).flat()
        )('Set setGpioOpenDrain index: %p', async ({ index, openDrain }) => {
            await pmic.setGpioOpenDrain(index, openDrain);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio open_drain set ${index} ${openDrain ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])(
            'Set setFuelGaugeEnabled enabled: %p',
            async enabled => {
                await pmic.setFuelGaugeEnabled(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setActiveBatteryModel', async () => {
            await pmic.setActiveBatteryModel('someProfileName');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge model set "someProfileName"`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])(
            'startBatteryStatusCheck enabled: %p',
            async enabled => {
                await pmic.setBatteryStatusCheckEnabled(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm_chg_status_check set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });
        test('Set setChargerVTerm onError case 1 - Fail immediately', async () => {
            await expect(pmic.setChargerVTerm(3.2)).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_voltage normal get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTerm onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(pmic.setChargerVTerm(3.2)).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ vTerm: 3.2 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_voltage normal set 3200`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_voltage normal get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerIChg onError case 1 - Fail immediately', async () => {
            await expect(pmic.setChargerIChg(32)).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger charger_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerIChg onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(pmic.setChargerIChg(32)).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 32 });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charger_current set 32`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger charger_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTrickleFast onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.setChargerVTrickleFast(2.5)
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
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger trickle get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTrickleFast onError case 2 - Fail immediately', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(
                pmic.setChargerVTrickleFast(2.5)
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
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger trickle set 2500`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger trickle get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerITerm  onError case 1 - Fail immediately', async () => {
            await expect(pmic.setChargerITerm('10%')).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });

            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger module charger get`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerITerm  onError case 2 - Fail immediately', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(pmic.setChargerITerm('10%')).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });

            // turn off charging
            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 0`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger termination_current set 10`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger termination_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.each([true, false])(
            'Set setChargerEnabledRecharging - Fail immediately -  enabled: %p',
            async enabled => {
                await expect(
                    pmic.setChargerEnabledRecharging(enabled)
                ).rejects.toBeUndefined();

                // turn off recharge
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module recharge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module recharge get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test.each([
            {
                mode: '100 kΩ',
                cliMode: 'ntc_100k',
            },
            {
                mode: '10 kΩ',
                cliMode: 'ntc_10k',
            },
            {
                mode: '47 kΩ',
                cliMode: 'ntc_47k',
            },
            {
                mode: 'HI Z',
                cliMode: 'ntc_hi_z',
            },
        ] as { mode: NTCThermistor; cliMode: string }[])(
            'Set setChargerNTCThermistor - onError case 2 - Fail immediately -  %p',
            async ({ mode, cliMode }) => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.setChargerNTCThermistor(mode)
                ).rejects.toBeUndefined();

                // turn chance ntc thermistor
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx adc ntc get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test.each(['100 kΩ', '10 kΩ', '47 kΩ'] as NTCThermistor[])(
            'Set setChargerNTCThermistor - Fail immediately - mode: %p',
            async mode => {
                await expect(
                    pmic.setChargerNTCThermistor(mode)
                ).rejects.toBeUndefined();

                // turn chance ntc thermistor
                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx charger module charger get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx adc ntc get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test.each([true, false])(
            'Set setChargerEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.setChargerEnabled(enabled)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx charger module charger set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npmx charger module charger get',
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnChargerUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setChargerTChgResume - Fail immediately', async () => {
            await expect(pmic.setChargerTChgResume(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger die_temp resume set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger die_temp resume get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTChgStop - Fail immediately', async () => {
            await expect(pmic.setChargerTChgStop(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger die_temp stop set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger die_temp stop get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.skip('Set setChargerTCold - Fail immediately', async () => {
            await expect(pmic.setChargerTCold(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.skip('Set setChargerTCool - Fail immediately', async () => {
            await expect(pmic.setChargerTCool(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.skip('Set setChargerTWarm - Fail immediately', async () => {
            await expect(pmic.setChargerTWarm(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.skip('Set setChargerTHot - Fail immediately', async () => {
            await expect(pmic.setChargerTWarm(90)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerVTermR - Fail immediately', async () => {
            await expect(pmic.setChargerVTermR(3.55)).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger termination_voltage warm set 3550`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger termination_voltage warm get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.skip('Set setChargerCurrentCool - Fail immediately', async () => {
            await expect(
                pmic.setChargerCurrentCool('iCHG')
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger module charger set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckVOutNormal(index, 1.8)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage normal get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckVOut - Fail on second command - index: %p',
            async index => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.setBuckVOutNormal(index, 1.8)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx buck vout select get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckVOutRetention(index, 1.7)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage retention set ${index} 1700`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage retention get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckMode - Fail immediately - vSet',
            async index => {
                await expect(
                    pmic.setBuckMode(index, 'vSet')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout select set ${index} 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout select get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckModeControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckModeControl(index, 'GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio pwm_force set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio pwm_force get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckOnOffControl(index, 'GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio on_off set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio on_off get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckRetentionControl(index, 'GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio retention set ${index} 2 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio retention get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckEnabled - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setBuckEnabled(index, true)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm1300_reg NPM_BUCK BUCKSTATUS`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_LDOS)(
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

        test.each(PMIC_1300_LDOS)(
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
            PMIC_1300_LDOS.map(index => [
                {
                    index,
                    enabled: false,
                },
                {
                    index,
                    enabled: true,
                },
            ]).flat()
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.setLdoEnabled(index, enabled)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw set ${index} ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_LDOS.map(index => [
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
                    pmic.setLdoMode(index, mode === 0 ? 'ldoSwitch' : 'LDO')
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

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIOModeValues.map((mode, modeIndex) => ({
                    index,
                    mode,
                    modeIndex,
                }))
            ).flat()
        )(
            'Set setGpioMode - Fail immediately - index: %p',
            async ({ index, mode, modeIndex }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setGpioMode(index, mode)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio mode set ${index} ${modeIndex}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                }))
            ).flat()
        )(
            'Set setGpioDrive - Fail immediately - index: %p',
            async ({ index, drive }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setGpioDrive(index, drive)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio drive set ${index} ${drive}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio drive get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIOPullValues.map((pull, pullIndex) => ({
                    index,
                    pull,
                    pullIndex,
                }))
            ).flat()
        )(
            'Set setGpioPull - Fail immediately - index: %p',
            async ({ index, pull, pullIndex }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setGpioPull(index, pull)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio pull set ${index} ${pullIndex}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio pull get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                }))
            ).flat()
        )(
            'Set setGpioDebounce - Fail immediately - index: %p',
            async ({ index, debounce }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setGpioDebounce(index, debounce)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio debounce set ${index} ${debounce ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio debounce get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                }))
            ).flat()
        )(
            'Set setGpioOpenDrain - Fail immediately - index: %p',
            async ({ index, openDrain }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.setGpioOpenDrain(index, openDrain)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio open_drain set ${index} ${
                        openDrain ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio open_drain get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each([true, false])(
            'Set setFuelGaugeEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.setFuelGaugeEnabled(enabled)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `fuel_gauge get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setActiveBatteryModel - Fail immediately', async () => {
            await expect(
                pmic.setActiveBatteryModel('someProfileName')
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge model set "someProfileName"`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `fuel_gauge model get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
