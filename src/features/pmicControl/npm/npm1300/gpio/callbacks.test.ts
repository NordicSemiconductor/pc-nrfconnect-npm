/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_GPIOS, setupMocksWithShellParser } from '../tests/helpers';
import {
    GPIODriveValues,
    GPIOModeKeys,
    GPIOModeValues,
    GPIOPullValues,
} from './types';

describe('PMIC 1300 - Command callbacks', () => {
    const { eventHandlers, mockOnGpioUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        PMIC_1300_GPIOS.map(index =>
            GPIOModeValues.map((mode, modeIndex) => [
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
    )('npmx gpio config mode %p', ({ index, append, mode, modeIndex }) => {
        const command = `npmx gpio config mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);
        const isInput = GPIOModeKeys[modeIndex].toString().startsWith('Input');

        callback?.onSuccess(`Value: ${modeIndex}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode,
                debounceEnabled: isInput,
                driveEnabled: !isInput,
                pullEnabled: isInput,
            },
            index,
        });
    });

    test.each(
        PMIC_1300_GPIOS.map(index =>
            GPIOPullValues.map((pull, pullIndex) => [
                {
                    index,
                    append: `get ${index}`,
                    pull,
                    pullIndex,
                },
                {
                    index,
                    append: `set ${index} ${pullIndex}`,
                    pull,
                    pullIndex,
                },
            ]).flat()
        ).flat()
    )('npmx gpio config pull %p', ({ index, append, pull, pullIndex }) => {
        const command = `npmx gpio config pull ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${pullIndex}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull },
            index,
        });
    });

    test.each(
        PMIC_1300_GPIOS.map(index =>
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
    )('npmx gpio config drive %p', ({ index, append, drive }) => {
        const command = `npmx gpio config drive ${append}`;
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
        PMIC_1300_GPIOS.map(index =>
            [true, false]
                .map(debounce => [
                    {
                        index,
                        append: `get ${index}`,
                        debounce,
                    },
                    {
                        index,
                        append: `set ${index} ${debounce ? '1' : '0'}`,
                        debounce,
                    },
                ])
                .flat()
        ).flat()
    )('npmx gpio config debounce %p', ({ index, append, debounce }) => {
        const command = `npmx gpio config debounce ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${debounce ? '1' : '0'}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce },
            index,
        });
    });

    test.each(
        PMIC_1300_GPIOS.map(index =>
            [true, false]
                .map(openDrain => [
                    {
                        index,
                        append: `get ${index}`,
                        openDrain,
                    },
                    {
                        index,
                        append: `set ${index} ${openDrain ? '1' : '0'}`,
                        openDrain,
                    },
                ])
                .flat()
        ).flat()
    )('npmx gpio config open_drain %p', ({ index, append, openDrain }) => {
        const command = `npmx gpio config open_drain ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${openDrain ? '1' : '0'}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { openDrain },
            index,
        });
    });
});
export {};
