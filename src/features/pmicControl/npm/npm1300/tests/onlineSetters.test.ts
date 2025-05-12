/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LEDModeValues,
    npm1300TimerMode,
    PmicDialog,
    POFPolarityValues,
    TimerPrescalerValues,
} from '../../types';
import { helpers, PMIC_1300_LEDS, setupMocksWithShellParser } from './helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
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
            PMIC_1300_LEDS.map(index =>
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
            expect(mockOnResetUpdate).toBeCalledTimes(0);
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
