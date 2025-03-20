/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../types';
import { GPIOMode2100, GPIOPull2100 } from '../gpio/types';
import { PMIC_2100_GPIOS, PMIC_2100_LDOS, setupMocksBase } from './helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 2100 - Setters Offline tests', () => {
    const {
        mockDialogHandler,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        pmic,
    } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_2100_LDOS)('Set setLdoVoltage index: %p', async index => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.ldoModule[index].set.voltage(1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_2100_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.ldoModule[index].set.enabled(false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioMode index: %p', async index => {
        await pmic.gpioModule[index].set.mode(GPIOMode2100.Input);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode: GPIOMode2100.Input,
                driveEnabled: true,
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

    test('Set setFuelGaugeEnabled', async () => {
        await pmic.fuelGaugeModule?.set.enabled(false);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
    });
});

export {};
