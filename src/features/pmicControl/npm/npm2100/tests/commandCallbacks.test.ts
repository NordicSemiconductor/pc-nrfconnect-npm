/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    GPIODriveValues,
    GPIOMode2100,
    GPIOModeValues,
    GPIOPullValues,
} from '../gpio/types';
import { npm2100TimerMode } from '../types';
import { PMIC_2100_GPIOS, setupMocksWithShellParser } from './helpers';

describe('PMIC 2100 - Command callbacks', () => {
    const {
        eventHandlers,
        mockOnGpioUpdate,
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

    test.each(
        PMIC_2100_GPIOS.map(index =>
            GPIOModeValues.map(mode => [
                {
                    index,
                    append: `get ${index}`,
                    mode,
                },
                {
                    index,
                    append: `set ${index} ${mode}`,
                    mode,
                },
            ]).flat(),
        ).flat(),
    )('npm2100 gpio mode %p', ({ index, append, mode }) => {
        const command = `npm2100 gpio mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        const isInput = mode === GPIOMode2100.Input;

        callback?.onSuccess(`Value: ${mode}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode,
                driveEnabled: !isInput,
                openDrainEnabled: !isInput,
                pullEnabled: true,
            },
            index,
        });
    });

    test.each(
        PMIC_2100_GPIOS.map(index =>
            GPIOPullValues.map(pull => [
                {
                    index,
                    append: `get ${index}`,
                    pull,
                },
                {
                    index,
                    append: `set ${index} ${pull}`,
                    pull,
                },
            ]).flat(),
        ).flat(),
    )('npm2100 gpio pull %p', ({ index, append, pull }) => {
        const command = `npm2100 gpio pull ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${pull}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull },
            index,
        });
    });

    test.each(
        PMIC_2100_GPIOS.map(index =>
            GPIODriveValues.map(drive => [
                {
                    index,
                    append: `get ${index}`,
                    drive,
                },
                {
                    index,
                    append: `set ${index} ${drive}`,
                    drive,
                },
            ]).flat(),
        ).flat(),
    )('npm2100 gpio drive %p', ({ index, append, drive }) => {
        const command = `npm2100 gpio drive ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${drive}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive },
            index,
        });
    });

    test.each(
        PMIC_2100_GPIOS.map(index =>
            [true, false]
                .map(debounce => [
                    {
                        index,
                        append: `get ${index}`,
                        debounce,
                    },
                    {
                        index,
                        append: `set ${index} ${debounce ? 'ON' : 'OFF'}`,
                        debounce,
                    },
                ])
                .flat(),
        ).flat(),
    )('npm2100 gpio debounce %p', ({ index, append, debounce }) => {
        const command = `npm2100 gpio debounce ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${debounce ? 'ON' : 'OFF'}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce },
            index,
        });
    });

    test.each(
        PMIC_2100_GPIOS.map(index =>
            [true, false]
                .map(openDrain => [
                    {
                        index,
                        append: `get ${index}`,
                        openDrain,
                    },
                    {
                        index,
                        append: `set ${index} ${openDrain ? 'ON' : 'OFF'}`,
                        openDrain,
                    },
                ])
                .flat(),
        ).flat(),
    )('npm2100 gpio opendrain %p', ({ index, append, openDrain }) => {
        const command = `npm2100 gpio opendrain ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${openDrain ? 'ON' : 'OFF'}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { openDrain },
            index,
        });
    });

    test.each(
        Object.keys(npm2100TimerMode)
            .map(mode => [
                {
                    append: `get`,
                    mode,
                },
                {
                    append: `set ${
                        npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
                    }`,
                    mode,
                },
            ])
            .flat(),
    )('npm2100 timer mode %p', ({ append, mode }) => {
        const command = `npm2100 timer mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `${append === 'get' ? 'Value:' : 'Value:'} ${
                npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
            }.`,
            command,
        );

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm2100TimerMode[mode as keyof typeof npm2100TimerMode],
        });
    });
});

export {};
