/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LEDModeValues,
    npm1300TimerMode,
    npm1300TimeToActive,
    PmicDialog,
    POFPolarityValues,
    TimerPrescalerValues,
} from '../../types';
import { GPIODriveValues, GPIOModeValues, GPIOPullValues } from '../gpio/types';
import {
    helpers,
    PMIC_1300_GPIOS,
    PMIC_1300_LEDS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnActiveBatteryModelUpdate,
        mockOnFuelGaugeUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
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

        test.each(
            Object.keys(npm1300TimerMode).map((modeKey, index) => ({
                modeKey,
                index,
            }))
        )('Set timer config mode %p', async ({ modeKey, index }) => {
            const mode =
                npm1300TimerMode[modeKey as keyof typeof npm1300TimerMode];
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
        });

        test.each(
            TimerPrescalerValues.map((prescaler, index) => ({
                prescaler,
                index,
            }))
        )('Set timer config mode %p', async ({ prescaler, index }) => {
            await pmic.timerConfigModule?.set.prescaler!(prescaler);

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
            await pmic.lowPowerModule?.set.timeToActive(
                npm1300TimeToActive['16ms']
            );

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ship config time set 16`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test('Set ship reset longpress two_button', async () => {
            await pmic.resetModule?.set.longPressReset?.('two_button');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_ship longpress set two_button`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnResetUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])(
            'Set setFuelGaugeEnabled enabled: %p',
            async enabled => {
                await pmic.fuelGaugeModule?.set.enabled(enabled);

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
            await pmic.fuelGaugeModule?.set.activeBatteryModel(
                'someProfileName'
            );

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
                await pmic.fuelGaugeModule?.set.batteryStatusCheckEnabled?.(
                    enabled
                );

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
            await pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(5);

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

        test.each(
            Object.keys(npm1300TimerMode).map((modeKey, index) => ({
                modeKey,
                index,
            }))
        )(
            'Set setTimerConfigMode - Fail immediately - index: %p',
            async ({ modeKey, index }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    }
                );

                const mode =
                    npm1300TimerMode[modeKey as keyof typeof npm1300TimerMode];
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
                    pmic.timerConfigModule?.set.prescaler!(prescaler)
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
                pmic.lowPowerModule?.set.timeToActive(
                    npm1300TimeToActive['16ms']
                )
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
            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test('Set setShipLongPressReset - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.resetModule?.set.longPressReset?.('one_button')
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
            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])(
            'Set setFuelGaugeEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.fuelGaugeModule?.set.enabled(enabled)
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
                pmic.fuelGaugeModule?.set.activeBatteryModel('someProfileName')
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
                pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(5)
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
