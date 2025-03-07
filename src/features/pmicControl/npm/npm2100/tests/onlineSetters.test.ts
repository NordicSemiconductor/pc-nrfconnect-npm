/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LEDModeValues, PmicDialog } from '../../types';
import { GPIODriveValues, GPIOModeValues, GPIOPullValues } from '../gpio/types';
import { helpers, PMIC_2100_GPIOS, setupMocksWithShellParser } from './helpers';

describe('PMIC 2100 - Setters Online tests', () => {
    const {
        eventHandlers,
        mockDialogHandler,
        mockOnActiveBatteryModelUpdate,
        mockOnFuelGaugeUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
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

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOModeValues.map(mode => ({
                    index,
                    mode,
                }))
            ).flat()
        )('Set setGpioMode index: %p', async ({ index, mode }) => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.gpioModule[index].set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(
                mode === 'OUTPUT' ? 2 : 1
            );
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm2100 gpio mode set ${index} ${mode}`,
                expect.anything(),
                undefined,
                true
            );
            if (mode === 'OUTPUT') {
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio state get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOPullValues.map(pull => ({
                    index,
                    pull,
                }))
            ).flat()
        )('Set setGpioPull index: %p', async ({ index, pull }) => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.gpioModule[index].set.pull(pull);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio pull set ${index} ${pull}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                }))
            ).flat()
        )('Set setGpioDrive index: %p', async ({ index, drive }) => {
            await pmic.gpioModule[index].set.drive(drive);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio drive set ${index} ${drive}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                }))
            ).flat()
        )('Set setGpioDebounce index: %p', async ({ index, debounce }) => {
            await pmic.gpioModule[index].set.debounce(debounce);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio debounce set ${index} ${debounce ? 'ON' : 'OFF'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                }))
            ).flat()
        )('Set setGpioOpenDrain index: %p', async ({ index, openDrain }) => {
            await pmic.gpioModule[index].set.openDrain(openDrain);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio opendrain set ${index} ${
                    openDrain ? 'ON' : 'OFF'
                }`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
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

        test('Set setFuelGaugeEnabled enabled: false', async () => {
            await pmic.fuelGaugeModule?.set.enabled(false);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge set 0`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
        });

        test('Set setFuelGaugeEnabled enabled: true', async () => {
            pmic.fuelGaugeModule?.set.enabled(true);
            await new Promise<void>(resolve => {
                mockEnqueueRequest.mockImplementationOnce(
                    (command, callbacks, timeout, unique) => {
                        expect(mockEnqueueRequest).toBeCalledTimes(3);
                        expect(mockEnqueueRequest).nthCalledWith(
                            1,
                            `fuel_gauge set 1`,
                            expect.anything(),
                            undefined,
                            true
                        );
                        // init fuel gauge with some load NCD-1074
                        expect(mockEnqueueRequest).nthCalledWith(
                            2,
                            `npm_adc sample 500 1000`,
                            expect.anything(),
                            undefined,
                            true
                        );
                        expect(mockEnqueueRequest).nthCalledWith(
                            3,
                            `npm2100 boost mode set HP`,
                            expect.anything(),
                            undefined,
                            true
                        );

                        resolve();
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
                                    );
                                });
                            });
                    }
                );
            });

            await new Promise<void>(resolve => {
                mockEnqueueRequest.mockImplementationOnce(
                    (command, callbacks, timeout, unique) => {
                        expect(mockEnqueueRequest).nthCalledWith(
                            4,
                            `fuel_gauge reset`,
                            expect.anything(),
                            undefined,
                            true
                        );

                        resolve();
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
                                    );
                                });
                            });
                    }
                );
            });

            await new Promise<void>(resolve => {
                mockEnqueueRequest.mockImplementationOnce(
                    (command, callbacks, timeout, unique) => {
                        expect(mockEnqueueRequest).nthCalledWith(
                            5,
                            `npm2100 boost mode set AUTO`,
                            expect.anything(),
                            undefined,
                            true
                        );
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
                                    );
                                });
                                resolve();
                            });
                    }
                );
            });

            expect(mockEnqueueRequest).nthCalledWith(
                6,
                `npm_adc sample 500 2000`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
        });

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
                await pmic.fuelGaugeModule?.set.batteryStatusCheckEnabled(
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
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOModeValues.map(mode => ({
                    index,
                    mode,
                }))
            ).flat()
        )(
            'Set setGpioMode - Fail immediately - index: %p',
            async ({ index, mode }) => {
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
                    `npm2100 gpio mode set ${index} ${mode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                }))
            ).flat()
        )(
            'Set setGpioDrive - Fail immediately - index: %p',
            async ({ index, drive }) => {
                await expect(
                    pmic.gpioModule[index].set.drive(drive)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio drive set ${index} ${drive}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio drive get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOPullValues.map(pull => ({
                    index,
                    pull,
                }))
            ).flat()
        )(
            'Set setGpioPull - Fail immediately - index: %p',
            async ({ index, pull }) => {
                await expect(
                    pmic.gpioModule[index].set.pull(pull)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio pull set ${index} ${pull}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio pull get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                }))
            ).flat()
        )(
            'Set setGpioDebounce - Fail immediately - index: %p',
            async ({ index, debounce }) => {
                await expect(
                    pmic.gpioModule[index].set.debounce(debounce)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio debounce set ${index} ${
                        debounce ? 'ON' : 'OFF'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio debounce get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                }))
            ).flat()
        )(
            'Set setGpioOpenDrain - Fail immediately - index: %p',
            async ({ index, openDrain }) => {
                await expect(
                    pmic.gpioModule[index].set.openDrain(openDrain)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio opendrain set ${index} ${
                        openDrain ? 'ON' : 'OFF'
                    }`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio opendrain get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            }
        );

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
    });
});

export {};
