/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LEDModeValues,
    NTCThermistor,
    PmicDialog,
    POFPolarityValues,
    SoftStartValues,
    TimerModeValues,
    TimerPrescalerValues,
} from '../../types';
import { GPIODriveValues, GPIOModeValues, GPIOPullValues } from '../gpio/types';
import {
    helpers,
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
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
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnShipUpdate,
        mockEnqueueRequest,
        mockOnUsbPower,
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
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charging_current set 32`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerBatLim', async () => {
            await pmic.chargerModule?.set.batLim(1000);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iBatLim: 1000 });

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
                `npm_adc fullscale set 1000`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTrickleFast', async () => {
            await pmic.chargerModule?.set.vTrickleFast(2.5);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger trickle_voltage set 2500`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerITerm', async () => {
            await pmic.chargerModule?.set.iTerm('10%');

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
                await pmic.chargerModule?.set.enabledRecharging(enabled);

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
            'Set setChargerEnabledVBatLow enabled: %p',
            async enabled => {
                await pmic.chargerModule?.set.enabledVBatLow(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `powerup_charger vbatlow set ${enabled ? '1' : '0'}`,
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
                await pmic.chargerModule?.set.enabled(enabled);

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
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx charger module charger set 0`,
                    expect.anything(),
                    undefined,
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    4,
                    `npmx adc ntc beta set ${beta}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
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
                    true
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
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
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx adc ntc beta set 3380`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTChgResume', async () => {
            await pmic.chargerModule?.set.tChgResume(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp resume set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTChgStop', async () => {
            await pmic.chargerModule?.set.tChgStop(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger die_temp stop set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTCold', async () => {
            await pmic.chargerModule?.set.tCold(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature cold set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTCool', async () => {
            await pmic.chargerModule?.set.tCool(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature cool set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTWarm', async () => {
            await pmic.chargerModule?.set.tWarm(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature warm set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerTHot', async () => {
            await pmic.chargerModule?.set.tHot(90);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger ntc_temperature hot set 90`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set chargerVTermR', async () => {
            await pmic.chargerModule?.set.vTermR(3.55);

            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx charger termination_voltage warm set 3550`,
                expect.anything(),
                undefined,
                true
            );
        });

        test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.buckModule[index].set.vOutNormal(1.8);

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
                `npmx buck vout_select set ${index} 1`,
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
                pmic.buckModule[1].set.vOutNormal(1.6)
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

            await pmic.buckModule[1].set.vOutNormal(1.6);
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
                `npmx buck vout_select set 1 1`,
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

            await pmic.buckModule[1].set.vOutNormal(1.6);
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
                `npmx buck vout_select set 1 1`,
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
                await pmic.buckModule[index].set.vOutRetention(1.8);

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
            await pmic.buckModule[index].set.mode('vSet');

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set ${index} 0`,
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
                pmic.buckModule[1].set.mode('software')
            ).rejects.toBeUndefined();

            expect(mockDialogHandler).toBeCalledTimes(1);

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckMode index: 1 with software - confirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.buckModule[1].set.mode('software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set 1 1`,
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

            await pmic.buckModule[1].set.mode('software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set 1 1`,
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
                await pmic.buckModule[index].set.modeControl('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `powerup_buck mode set ${index} GPIO2`,
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
                await pmic.buckModule[index].set.onOffControl('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio on_off index set ${index} 2`,
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
                await pmic.buckModule[index].set.retentionControl('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio retention index set ${index} 2`,
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
                await pmic.buckModule[index].set.enabled(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck status set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckActiveDischargeEnabled index: %p',
            async index => {
                await pmic.buckModule[index].set.activeDischarge(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck active_discharge set ${index} 1`,
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

            await expect(
                pmic.buckModule[1].set.enabled(false)
            ).rejects.toBeUndefined();
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

            await pmic.buckModule[1].set.enabled(false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck status set 1 0`,
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

            await pmic.buckModule[1].set.enabled(false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck status set 1 0`,
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
            PMIC_1300_LDOS.map(index =>
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
            PMIC_1300_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                }))
            ).flat()
        )('Set setLdoSoftStart %p', async ({ index, enabled }) => {
            await pmic.setLdoSoftStartEnabled?.(index, enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start enable set ${index} ${
                    enabled ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_LDOS.map(index =>
                SoftStartValues.map(softStart => ({
                    index,
                    softStart,
                }))
            ).flat()
        )('Set setLdoSoftStart %p', async ({ index, softStart }) => {
            await pmic.setLdoSoftStart?.(index, softStart);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start current set ${index} ${softStart}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                }))
            ).flat()
        )('Set setLdoEnabled %p', async ({ index, enabled }) => {
            await pmic.setLdoActiveDischarge?.(index, enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw active_discharge set ${index} ${
                    enabled ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_LDOS)(
            'Set setLdoOnOffControl index: %p',
            async index => {
                await pmic.setLdoOnOffControl?.(index, 'GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw gpio index set ${index} 2`,
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
        )('Set setGpioMode index: %p', async ({ index, mode, modeIndex }) => {
            await pmic.gpioModule[index].set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config mode set ${index} ${modeIndex}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
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
            await pmic.gpioModule[index].set.pull(pull);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config pull set ${index} ${pullIndex}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                }))
            ).flat()
        )('Set setGpioDrive index: %p', async ({ index, drive }) => {
            await pmic.gpioModule[index].set.drive(drive);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config drive set ${index} ${drive}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                }))
            ).flat()
        )('Set setGpioDebounce index: %p', async ({ index, debounce }) => {
            await pmic.gpioModule[index].set.debounce(debounce);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config debounce set ${index} ${
                    debounce ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                }))
            ).flat()
        )('Set setGpioOpenDrain index: %p', async ({ index, openDrain }) => {
            await pmic.gpioModule[index].set.openDrain(openDrain);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config open_drain set ${index} ${
                    openDrain ? '1' : '0'
                }`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_1300_GPIOS.map(index =>
                LEDModeValues.map((mode, modeIndex) => ({
                    index,
                    mode,
                    modeIndex,
                }))
            ).flat()
        )('Set setLedMode index: %p', async ({ index, mode, modeIndex }) => {
            await pmic.setLedMode(index, mode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx led mode set ${index} ${modeIndex}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLEDUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])('Set pof enable %p', async enable => {
            await pmic.pofModule?.set.enabled(enable);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof status set ${enable ? '1' : '0'}`,
                expect.anything(),
                undefined,
                true
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
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test.each(
            POFPolarityValues.map((polarity, index) => ({ polarity, index }))
        )('Set pof polarity %p', async ({ polarity, index }) => {
            await pmic.pofModule?.set.polarity(polarity);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof polarity set ${index}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test.each(TimerModeValues.map((mode, index) => ({ mode, index })))(
            'Set timer config mode %p',
            async ({ mode, index }) => {
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
            }
        );

        test.each(
            TimerPrescalerValues.map((prescaler, index) => ({
                prescaler,
                index,
            }))
        )('Set timer config mode %p', async ({ prescaler, index }) => {
            await pmic.timerConfigModule?.set.prescaler(prescaler);

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

        test('Set ship config time %p', async () => {
            await pmic.shipModeModule?.set.timeToActive(16);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ship config time set 16`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnShipUpdate).toBeCalledTimes(0);
        });

        test('Set ship reset longpress two_button', async () => {
            await pmic.shipModeModule?.set.longPressReset('two_button');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_ship longpress set two_button`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnShipUpdate).toBeCalledTimes(0);
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

        test('Set vBusinCurrentLimiter', async () => {
            await pmic.setVBusinCurrentLimiter(5);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx vbusin current_limit set 5000`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnUsbPower).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });
        test('Set setChargerVTerm onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTerm(3.2)
            ).rejects.toBeUndefined();

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

            await expect(
                pmic.chargerModule?.set.vTerm(3.2)
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
            await expect(
                pmic.chargerModule?.set.iChg(32)
            ).rejects.toBeUndefined();

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
                `npmx charger charging_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerIChg onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(
                pmic.chargerModule?.set.iChg(32)
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
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx charger charging_current set 32`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger charging_current get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerBatLim onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.batLim(1000)
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iBatLim: 1000 });

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
                `npm_adc fullscale get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerBatLim onError case 2 - Fail on second command', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(
                pmic.chargerModule?.set.batLim(1000)
            ).rejects.toBeUndefined();

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).toBeCalledWith({ iBatLim: 1000 });

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
                `npm_adc fullscale set 1000`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npm_adc fullscale get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerVTrickleFast onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTrickleFast(2.5)
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
                `npmx charger trickle_voltage get`,
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
                pmic.chargerModule?.set.vTrickleFast(2.5)
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
                `npmx charger trickle_voltage set 2500`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npmx charger trickle_voltage get`,
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerITerm  onError case 1 - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.iTerm('10%')
            ).rejects.toBeUndefined();

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

            await expect(
                pmic.chargerModule?.set.iTerm('10%')
            ).rejects.toBeUndefined();

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
                    pmic.chargerModule?.set.enabledRecharging(enabled)
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

        test.each([true, false])(
            'Set setChargerEnableVBatLow - Fail immediately -  enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabledVBatLow(enabled)
                ).rejects.toBeUndefined();

                // turn off vbatlow
                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `powerup_charger vbatlow set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `powerup_charger vbatlow get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
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
                    helpers.registerCommandCallbackSuccess
                );

                await expect(
                    pmic.chargerModule?.set.nTCThermistor(mode)
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
                    `npmx adc ntc type set ${cliMode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx adc ntc type get`,
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
                    pmic.chargerModule?.set.nTCThermistor(mode)
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
                    `npmx adc ntc type get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test('Set setChargerNTCBeta - Fail immediately : %p', async () => {
            await expect(
                pmic.chargerModule?.set.nTCBeta(3380)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
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
                'npmx charger module charger get',
                expect.anything(),
                undefined,
                true
            );
        });

        test('Set setChargerNTCBeta - Fail immediately case 2: %p', async () => {
            mockEnqueueRequest.mockImplementationOnce(
                helpers.registerCommandCallbackSuccess
            );

            await expect(
                pmic.chargerModule?.set.nTCBeta(3380)
            ).rejects.toBeUndefined();

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
                'npmx adc ntc beta set 3380',
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                'npmx adc ntc beta get',
                expect.anything(),
                undefined,
                true
            );
        });

        test.each([true, false])(
            'Set setChargerEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.chargerModule?.set.enabled(enabled)
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
            await expect(
                pmic.chargerModule?.set.tChgResume(90)
            ).rejects.toBeUndefined();

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
            await expect(
                pmic.chargerModule?.set.tChgStop(90)
            ).rejects.toBeUndefined();

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

        test('Set setChargerTCold - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCold(90)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature cold set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature cold get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTCool - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tCool(90)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature cool set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature cool get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTWarm - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tWarm(90)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature warm set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature warm get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerTHot - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.tHot(90)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx charger ntc_temperature hot set 90`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npmx charger ntc_temperature hot get',
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnChargerUpdate).toBeCalledTimes(0);
        });

        test('Set setChargerVTermR - Fail immediately', async () => {
            await expect(
                pmic.chargerModule?.set.vTermR(3.55)
            ).rejects.toBeUndefined();

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

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.vOutNormal(1.8)
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
                    pmic.buckModule[index].set.vOutNormal(1.8)
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
                    `npmx buck vout_select set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx buck vout_select get ${index}`,
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
                    pmic.buckModule[index].set.vOutRetention(1.7)
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
                    pmic.buckModule[index].set.mode('vSet')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout_select set ${index} 0`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout_select get ${index}`,
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
                    pmic.buckModule[index].set.modeControl('GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `powerup_buck mode set ${index} GPIO2`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `powerup_buck mode get ${index}`,
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
                    pmic.buckModule[index].set.onOffControl('GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio on_off index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio on_off index get ${index}`,
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
                    pmic.buckModule[index].set.retentionControl('GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio retention index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio retention index get ${index}`,
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
                    pmic.buckModule[index].set.enabled(true)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck status set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck status get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckActiveDischargeEnabled - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.activeDischarge(true)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck active_discharge set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck active_discharge get ${index}`,
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
            PMIC_1300_LDOS.map(index =>
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

        test.each(
            PMIC_1300_LDOS.map(index =>
                [true, false].map(enabled => ({
                    index,
                    enabled,
                }))
            ).flat()
        )(
            'Set setLdoSoftStartEnabled - Fail immediately - %p',
            async ({ index, enabled }) => {
                await expect(
                    pmic.setLdoSoftStartEnabled?.(index, enabled)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw soft_start enable set ${index} ${
                        enabled ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw soft_start enable get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_LDOS.map(index =>
                SoftStartValues.map(softStart => ({
                    index,
                    softStart,
                }))
            ).flat()
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, softStart }) => {
                await expect(
                    pmic.setLdoSoftStart?.(index, softStart)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw soft_start current set ${index} ${softStart}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw soft_start current get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_LDOS.map(index =>
                [true, false].map(activeDischarge => ({
                    index,
                    activeDischarge,
                }))
            ).flat()
        )(
            'Set setLdoEnabled - Fail immediately - %p',
            async ({ index, activeDischarge }) => {
                await expect(
                    pmic.setLdoActiveDischarge?.(index, activeDischarge)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw active_discharge set ${index} ${
                        activeDischarge ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw active_discharge get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLdoUpdate).toBeCalledTimes(0);
            }
        );

        test.each(PMIC_1300_LDOS)(
            'Set setLdoOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.setLdoOnOffControl?.(index, 'GPIO2')
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx ldsw gpio index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx ldsw gpio index get ${index}`,
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
                    pmic.gpioModule[index].set.mode(mode)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio config mode set ${index} ${modeIndex}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio config mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
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
                    pmic.gpioModule[index].set.drive(drive)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio config drive set ${index} ${drive}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio config drive get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
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
                    pmic.gpioModule[index].set.pull(pull)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio config pull set ${index} ${pullIndex}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio config pull get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
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
                    pmic.gpioModule[index].set.debounce(debounce)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio config debounce set ${index} ${
                        debounce ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio config debounce get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
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
                    pmic.gpioModule[index].set.openDrain(openDrain)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx gpio config open_drain set ${index} ${
                        openDrain ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx gpio config open_drain get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_1300_LEDS.map(index =>
                LEDModeValues.map((mode, modeIndex) => ({
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
                    pmic.setLedMode(index, mode)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx led mode set ${index} ${modeIndex}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx led mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnLEDUpdate).toBeCalledTimes(0);
            }
        );

        test.each([true, false])(
            'Set setPOFEnable - Fail immediately - index: %p',
            async enable => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.pofModule?.set.enabled(enable)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx pof status set ${enable ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx pof status get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnPOFUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            POFPolarityValues.map((polarity, index) => ({ polarity, index }))
        )(
            'Set setPOFPolarity - Fail immediately - index: %p',
            async ({ polarity, index }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                await expect(
                    pmic.pofModule?.set.polarity(polarity)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx pof polarity set ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx pof polarity get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnPOFUpdate).toBeCalledTimes(0);
            }
        );

        test('Set setPOFThreshold - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.pofModule?.set.threshold(2.7)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx pof threshold set 2700`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx pof threshold get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnPOFUpdate).toBeCalledTimes(0);
        });

        test.each(TimerModeValues.map((mode, index) => ({ mode, index })))(
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
                    pmic.timerConfigModule?.set.prescaler(prescaler)
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

        test('Set setShipModeTimeToActive - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.shipModeModule?.set.timeToActive(16)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ship config time set 16`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx ship config time get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnShipUpdate).toBeCalledTimes(0);
        });

        test('Set setShipLongPressReset - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.shipModeModule?.set.longPressReset('one_button')
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_ship longpress set one_button`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `powerup_ship longpress get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnShipUpdate).toBeCalledTimes(0);
        });

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

        test('Set vBusinCurrentLimiter - Fail immediately', async () => {
            await expect(
                pmic.setVBusinCurrentLimiter(5)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx vbusin current_limit set 5000`,
                expect.anything(),
                undefined,
                true
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx vbusin current_limit get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnUsbPower).toBeCalledTimes(0);
        });
    });
});

export {};
