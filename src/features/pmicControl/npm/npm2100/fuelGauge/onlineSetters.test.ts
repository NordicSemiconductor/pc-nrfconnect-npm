/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Setters Online tests', () => {
    describe('Setters and effects state - success', () => {
        const {
            eventHandlers,
            mockDialogHandler,
            mockOnActiveBatteryModelUpdate,
            mockOnFuelGaugeUpdate,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set setFuelGaugeEnabled enabled: false', async () => {
            await pmic.fuelGaugeModule?.set.enabled(false);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge set 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])(
            'Set fuel_gauge discard_positive_deltaz enabled: false',
            async enabled => {
                await pmic.fuelGaugeModule?.set.discardPosiiveDeltaZ?.(enabled);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge params runtime discard_positive_deltaz set ${
                        enabled ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
            },
        );

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
                            true,
                        );
                        // init fuel gauge with some load NCD-1074
                        expect(mockEnqueueRequest).nthCalledWith(
                            2,
                            `npm_adc sample 500 1000`,
                            expect.anything(),
                            undefined,
                            true,
                        );
                        expect(mockEnqueueRequest).nthCalledWith(
                            3,
                            `npm2100 boost mode set HP`,
                            expect.anything(),
                            undefined,
                            true,
                        );

                        resolve();
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique,
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001',
                                    );
                                });
                            });
                    },
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
                            true,
                        );

                        resolve();
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique,
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001',
                                    );
                                });
                            });
                    },
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
                            true,
                        );
                        return helpers
                            .registerCommandCallbackSuccess(
                                command,
                                callbacks,
                                timeout,
                                unique,
                            )
                            .then(() => {
                                process.nextTick(() => {
                                    eventHandlers.mockOnShellLoggingEventHandler(
                                        '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001',
                                    );
                                });
                                resolve();
                            });
                    },
                );
            });

            expect(mockEnqueueRequest).nthCalledWith(
                6,
                `npm_adc sample 500 2000`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
        });

        test('Set setActiveBatteryModel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.fuelGaugeModule?.set.activeBatteryModel(
                'someProfileName',
            );

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge model set "someProfileName"`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        const {
            mockDialogHandler,
            mockOnActiveBatteryModelUpdate,
            mockOnFuelGaugeUpdate,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each([true, false])(
            'Set setFuelGaugeEnabled - Fail immediately - enabled: %p',
            async enabled => {
                await expect(
                    pmic.fuelGaugeModule?.set.enabled(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge set ${enabled ? '1' : '0'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `fuel_gauge get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
            },
        );

        test.each([true, false])(
            'Set discard_positive_deltaz - Fail immediately: %p',
            async enabled => {
                await expect(
                    pmic.fuelGaugeModule?.set.discardPosiiveDeltaZ?.(enabled),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `fuel_gauge params runtime discard_positive_deltaz set ${
                        enabled ? '1' : '0'
                    }`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `fuel_gauge params runtime discard_positive_deltaz get`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setActiveBatteryModel - Fail immediately', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.fuelGaugeModule?.set.activeBatteryModel('someProfileName'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `fuel_gauge model set "someProfileName"`,
                expect.anything(),
                undefined,
                true,
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `fuel_gauge model get`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
