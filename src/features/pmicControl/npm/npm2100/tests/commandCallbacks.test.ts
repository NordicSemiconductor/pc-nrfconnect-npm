/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryModel, FuelGauge } from '../../types';
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
        mockOnFuelGaugeUpdate,
        mockOnActiveBatteryModelUpdate,
        mockEnqueueRequest,
        mockOnStoredBatteryModelUpdate,
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
        [true, false]
            .map(enabled => [
                {
                    enabled,
                    append: 'get',
                },
                {
                    enabled,
                    append: `set ${enabled ? '1' : '0'}`,
                },
            ])
            .flat()
    )('fuel_gauge %p', ({ enabled, append }) => {
        const command = `fuel_gauge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith({
            enabled,
        } satisfies Partial<FuelGauge>);
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    enabled,
                    append: 'get',
                },
                {
                    enabled,
                    append: `set ${enabled ? '1' : '0'}`,
                },
            ])
            .flat()
    )(
        'fuel_gauge params runtime discard_positive_deltaz %p',
        ({ enabled, append }) => {
            const command = `fuel_gauge params runtime discard_positive_deltaz ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

            expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
            expect(mockOnFuelGaugeUpdate).toBeCalledWith({
                discardPosiiveDeltaZ: enabled,
            } satisfies Partial<FuelGauge>);
        }
    );

    test.each(['get', 'set "Generic_AA"'])('fuel_gauge model %p', append => {
        const command = `fuel_gauge model ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `value: name="Generic_AA",Q={2000.00 mAh}`,
            command
        );

        expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnActiveBatteryModelUpdate).toBeCalledWith({
            name: 'Generic_AA',
            batteryClass: 'Primary',
            characterizations: [
                {
                    capacity: 2000.0,
                },
            ],
        } as BatteryModel);
    });

    test('fuel_gauge model store', () => {
        const command = `fuel_gauge model store`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            'Success: Model stored to persistent memory.',
            command
        );

        expect(mockEnqueueRequest).toBeCalledTimes(2);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            'fuel_gauge model list',
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            2,
            'fuel_gauge model get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('fuel_gauge model list has stored battery', () => {
        const command = 'fuel_gauge model list';
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        const response = `Currently active battery model:
        name="AA_Alkaline",Q={2000.00 mAh}
Hardcoded battery models:
        name="AA_Alkaline",Q={2000.00 mAh}
        name="AAA_Alkaline",Q={1200.00 mAh}
Battery models stored in database:
        Slot 0: Empty
        Slot 1: name="AAAA_Alkaline",Q={1000.00 mAh}
        Slot 2: Empty`;

        callback?.onSuccess(response, command);

        expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([
            {
                name: 'AAAA_Alkaline',
                characterizations: [
                    {
                        capacity: 1000.0,
                    },
                ],
                slotIndex: 1,
            },
        ] as (BatteryModel | null)[]);
    });

    test('fuel_gauge model list no stored battery', () => {
        const command = 'fuel_gauge model list';
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        const response = `Currently active battery model:
        name="AA_Alkaline",Q={2000.00 mAh}
Hardcoded battery models:
        name="AA_Alkaline",Q={2000.00 mAh}
        name="AAA_Alkaline",Q={1200.00 mAh}
Battery models stored in database:
        Slot 0: Empty
        Slot 1: Empty
        Slot 2: Empty`;
        callback?.onSuccess(response, command);

        expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([]);
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

        const isOutput = mode === GPIOMode2100.Output;
        const isInterrupt =
            mode === GPIOMode2100['Interrupt output, active high'] ||
            mode === GPIOMode2100['Interrupt output, active low'];

        callback?.onSuccess(`Value: ${mode}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode,
                driveEnabled: !isInterrupt,
                openDrainEnabled: isOutput,
                pullEnabled: !isInterrupt,
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
            .flat()
    )('npm2100 timer mode %p', ({ append, mode }) => {
        const command = `npm2100 timer mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `${append === 'get' ? 'Value:' : 'Value:'} ${
                npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
            }.`,
            command
        );

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm2100TimerMode[mode as keyof typeof npm2100TimerMode],
        });
    });
});

export {};
