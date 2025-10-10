/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_GPIOS, setupMocksBase } from '../tests/helpers';
import { GPIOMode2100, GPIOPull2100 } from './types';

describe('PMIC 2100 - Setters Offline tests', () => {
    const { mockOnGpioUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioMode index: %p', async index => {
        await pmic.gpioModule[index].set.mode(GPIOMode2100.Input);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode: GPIOMode2100.Input,
                driveEnabled: false,
                openDrainEnabled: false,
                pullEnabled: true,
            },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioPull index: %p', async index => {
        await pmic.gpioModule[index].set.pull(GPIOPull2100['Pull down']);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull: GPIOPull2100['Pull down'] },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDrive index: %p', async index => {
        await pmic.gpioModule[index].set.drive(1);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive: 1 },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDebounce index: %p', async index => {
        await pmic.gpioModule[index].set.debounce(true);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce: true },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)(
        'Set setGpioOpenDrain index: %p',
        async index => {
            await pmic.gpioModule[index].set.openDrain(true);

            expect(mockOnGpioUpdate).toBeCalledTimes(1);
            expect(mockOnGpioUpdate).toBeCalledWith({
                data: { openDrain: true },
                index,
            });
        }
    );
});

export {};
