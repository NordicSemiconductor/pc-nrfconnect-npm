/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    GPIODriveValues,
    GPIOModeValues,
    GPIOPullValues,
} from '../../npm1300/gpio/types';
import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { PMIC_1304_GPIOS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnGpioUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test.each(
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test.each(
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
            PMIC_1304_GPIOS.map(index =>
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
    });
});

export {};
