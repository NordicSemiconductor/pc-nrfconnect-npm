/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_GPIOS, setupMocksWithShellParser } from '../tests/helpers';
import {
    GPIODriveValues,
    GPIOMode2100,
    GPIOModeValues,
    GPIOPullValues,
} from './types';

describe('PMIC 2100 - Command callbacks', () => {
    const { eventHandlers, mockOnGpioUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
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
            ]).flat()
        ).flat()
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
            ]).flat()
        ).flat()
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
            ]).flat()
        ).flat()
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
                .flat()
        ).flat()
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
                .flat()
        ).flat()
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
});

export {};
