/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { PMIC_2100_GPIOS, setupMocksWithShellParser } from '../tests/helpers';
import { GPIODriveValues, GPIOModeValues, GPIOPullValues } from './types';

describe('PMIC 2100 - Setters Online tests', () => {
    describe('Setters and effects state - success', () => {
        const {
            mockDialogHandler,
            mockOnGpioUpdate,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOModeValues.map(mode => ({
                    index,
                    mode,
                })),
            ).flat(),
        )('Set setGpioMode index: %p', async ({ index, mode }) => {
            if (index === 0) {
                mockDialogHandler.mockImplementation((dialog: PmicDialog) => {
                    dialog.onConfirm();
                });
            }

            await pmic.gpioModule[index].set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(
                mode === 'OUTPUT' ? 2 : 1,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm2100 gpio mode set ${index} ${mode}`,
                expect.anything(),
                undefined,
                true,
            );
            if (mode === 'OUTPUT') {
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio state get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
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
                })),
            ).flat(),
        )('Set setGpioPull index: %p', async ({ index, pull }) => {
            if (index === 0) {
                mockDialogHandler.mockImplementation((dialog: PmicDialog) => {
                    dialog.onConfirm();
                });
            }

            await pmic.gpioModule[index].set.pull(pull);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio pull set ${index} ${pull}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                })),
            ).flat(),
        )('Set setGpioDrive index: %p', async ({ index, drive }) => {
            await pmic.gpioModule[index].set.drive(drive);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio drive set ${index} ${drive}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                })),
            ).flat(),
        )('Set setGpioDebounce index: %p', async ({ index, debounce }) => {
            await pmic.gpioModule[index].set.debounce(debounce);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio debounce set ${index} ${debounce ? 'ON' : 'OFF'}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                })),
            ).flat(),
        )('Set setGpioOpenDrain index: %p', async ({ index, openDrain }) => {
            await pmic.gpioModule[index].set.openDrain(openDrain);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 gpio opendrain set ${index} ${
                    openDrain ? 'ON' : 'OFF'
                }`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnGpioUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        const {
            mockDialogHandler,
            mockOnGpioUpdate,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOModeValues.map(mode => ({
                    index,
                    mode,
                })),
            ).flat(),
        )(
            'Set setGpioMode - Fail immediately - index: %p',
            async ({ index, mode }) => {
                mockDialogHandler.mockImplementationOnce(
                    (dialog: PmicDialog) => {
                        dialog.onConfirm();
                    },
                );

                await expect(
                    pmic.gpioModule[index].set.mode(mode),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio mode set ${index} ${mode}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIODriveValues.map(drive => ({
                    index,
                    drive,
                })),
            ).flat(),
        )(
            'Set setGpioDrive - Fail immediately - index: %p',
            async ({ index, drive }) => {
                await expect(
                    pmic.gpioModule[index].set.drive(drive),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio drive set ${index} ${drive}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio drive get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                GPIOPullValues.map(pull => ({
                    index,
                    pull,
                })),
            ).flat(),
        )(
            'Set setGpioPull - Fail immediately - index: %p',
            async ({ index, pull }) => {
                await expect(
                    pmic.gpioModule[index].set.pull(pull),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio pull set ${index} ${pull}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio pull get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(debounce => ({
                    index,
                    debounce,
                })),
            ).flat(),
        )(
            'Set setGpioDebounce - Fail immediately - index: %p',
            async ({ index, debounce }) => {
                await expect(
                    pmic.gpioModule[index].set.debounce(debounce),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio debounce set ${index} ${
                        debounce ? 'ON' : 'OFF'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio debounce get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            },
        );

        test.each(
            PMIC_2100_GPIOS.map(index =>
                [true, false].map(openDrain => ({
                    index,
                    openDrain,
                })),
            ).flat(),
        )(
            'Set setGpioOpenDrain - Fail immediately - index: %p',
            async ({ index, openDrain }) => {
                await expect(
                    pmic.gpioModule[index].set.openDrain(openDrain),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 gpio opendrain set ${index} ${
                        openDrain ? 'ON' : 'OFF'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 gpio opendrain get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnGpioUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
