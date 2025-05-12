/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    LEDModeValues,
    npm1300TimerMode,
    TimerPrescalerValues,
    USBDetectStatusValues,
} from '../../types';
import { PMIC_1300_LEDS, setupMocksWithShellParser } from './helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const {
        eventHandlers,
        mockOnUsbPower,
        mockOnLEDUpdate,
        mockOnTimerConfigUpdate,
        mockOnReboot,
    } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('kernel reboot - success', () => {
        const command = `delayed_reboot 100`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Success:', command);

        expect(mockOnReboot).toBeCalledTimes(1);
        expect(mockOnReboot).toBeCalledWith(true);
    });

    test('kernel reboot - error', () => {
        const command = `delayed_reboot 100`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onError('Error: some message', command);

        expect(mockOnReboot).toBeCalledTimes(1);
        expect(mockOnReboot).toBeCalledWith(false, 'Error: some message');
    });

    test.each(USBDetectStatusValues.map((state, index) => ({ state, index })))(
        'powerup_vbusin status get %p',
        ({ state, index }) => {
            const command = `powerup_vbusin status get`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${index}`, command);

            expect(mockOnUsbPower).toBeCalledTimes(1);
            expect(mockOnUsbPower).toBeCalledWith({ detectStatus: state });
        }
    );

    test.each(
        PMIC_1300_LEDS.map(index =>
            LEDModeValues.map((mode, modeIndex) => [
                {
                    index,
                    append: `get ${index}`,
                    mode,
                    modeIndex,
                },
                {
                    index,
                    append: `set ${index} ${modeIndex}`,
                    mode,
                    modeIndex,
                },
            ]).flat()
        ).flat()
    )('npmx led mode %p', ({ index, append, mode, modeIndex }) => {
        const command = `npmx led mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${modeIndex}.`, command);

        expect(mockOnLEDUpdate).toBeCalledTimes(1);
        expect(mockOnLEDUpdate).toBeCalledWith({
            data: { mode },
            index,
        });
    });

    test.each(
        Object.keys(npm1300TimerMode)
            .map((mode, modeIndex) => [
                {
                    append: `get`,
                    mode,
                    modeIndex,
                },
                {
                    append: `set ${modeIndex}`,
                    mode,
                    modeIndex,
                },
            ])
            .flat()
    )('npmx timer config mode %p', ({ append, mode, modeIndex }) => {
        const command = `npmx timer config mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${modeIndex}.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode,
        });
    });

    test.each(
        TimerPrescalerValues.map((prescaler, prescalerIndex) => [
            {
                append: `get`,
                prescaler,
                prescalerIndex,
            },
            {
                append: `set ${prescalerIndex}`,
                prescaler,
                prescalerIndex,
            },
        ]).flat()
    )(
        'npmx timer config prescaler %p',
        ({ append, prescaler, prescalerIndex }) => {
            const command = `npmx timer config prescaler ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${prescalerIndex}.`, command);

            expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
            expect(mockOnTimerConfigUpdate).toBeCalledWith({
                prescaler,
            });
        }
    );

    test.each([`get`, `set 2800`])('npmx timer config compare %p', append => {
        const command = `npmx timer config compare ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2800.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            period: 2800,
        });
    });

    test.each(['get', 'set 500'])('npmx vbusin current_limit %p', append => {
        const command = `npmx vbusin current_limit ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 500 mA.`, command);

        expect(mockOnUsbPower).toBeCalledTimes(1);
        expect(mockOnUsbPower).toBeCalledWith({
            currentLimiter: 0.5,
        });
    });
});
export {};
