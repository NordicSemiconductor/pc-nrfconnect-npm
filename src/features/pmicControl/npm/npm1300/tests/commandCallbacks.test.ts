/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatteryModel,
    FuelGauge,
    GPIOValues,
    LdoOnOffControlValues,
    LEDModeValues,
    LongPressResetValues,
    npm1300TimerMode,
    npm1300TimeToActive,
    POFPolarityValues,
    TimerPrescalerValues,
    USBDetectStatusValues,
} from '../../types';
import {
    GPIODriveValues,
    GPIOModeKeys,
    GPIOModeValues,
    GPIOPullValues,
} from '../gpio/types';
import { SoftStartValues } from '../ldo/types';
import {
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const {
        eventHandlers,
        mockOnFuelGaugeUpdate,
        mockOnActiveBatteryModelUpdate,
        mockEnqueueRequest,
        mockOnStoredBatteryModelUpdate,
        mockOnUsbPower,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnPOFUpdate,
        mockOnLEDUpdate,
        mockOnTimerConfigUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
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

    test.each(['get', 'set "LP803448"'])('fuel_gauge model %p', append => {
        const command = `fuel_gauge model ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `Value: name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}`,
            command
        );

        expect(mockOnActiveBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnActiveBatteryModelUpdate).toBeCalledWith({
            name: 'LP803448',
            characterizations: [
                {
                    temperature: 45,
                    capacity: 1500.11,
                },
                {
                    temperature: 25,
                    capacity: 1518.28,
                },
                {
                    temperature: 5,
                    capacity: 1413.4,
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
        name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
Hardcoded battery models:
        name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
        name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
        name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
        name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
        name="LP502540",T={25.00 C},Q={563.08 mAh}
        name="LP503030",T={25.00 C},Q={495.98 mAh}
Battery models stored in database:
        Slot 0: Empty
        Slot 1: name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
        Slot 2: Empty`;

        callback?.onSuccess(response, command);

        expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([
            {
                name: 'LP803448',
                characterizations: [
                    {
                        temperature: 45,
                        capacity: 1500.11,
                    },
                    {
                        temperature: 25,
                        capacity: 1518.28,
                    },
                    {
                        temperature: 5,
                        capacity: 1413.4,
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
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
        Hardcoded battery models:
            name="LP302535",T={5.00 C,25.00 C,45.00 C},Q={273.95 mAh,272.80 mAh,269.23 mAh}
            name="LP353035",T={5.00 C,25.00 C,45.00 C},Q={406.15 mAh,422.98 mAh,420.56 mAh}
            name="LP301226",T={5.00 C,25.00 C,45.00 C},Q={68.99 mAh,70.43 mAh,65.50 mAh}
            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
            name="LP502540",T={25.00 C},Q={563.08 mAh}
            name="LP503030",T={25.00 C},Q={495.98 mAh}
        Battery models stored in database:
            Slot 0: Empty
            Slot 1: Empty
            Slot 2: Empty`;
        callback?.onSuccess(response, command);

        expect(mockOnStoredBatteryModelUpdate).toBeCalledTimes(1);
        expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([]);
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
        PMIC_1300_LDOS.map(index => [
            ...[true, false].map(enabled =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        enabled,
                    },
                    {
                        index,
                        append: `set ${index} ${enabled ? '1' : '0'} `,
                        enabled,
                    },
                ].flat()
            ),
        ]).flat()
    )('npmx ldsw %p', ({ index, append, enabled }) => {
        const command = `npmx ldsw status ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled },
            index,
        });
    });

    test.each(
        PMIC_1300_LDOS.map(index => [
            [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 1300`,
                },
            ].flat(),
        ]).flat()
    )('npmx ldsw voltage %p', ({ index, append }) => {
        const command = `npmx ldsw ldo_voltage ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 1300mV.`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.3 },
            index,
        });
    });

    test.each(
        PMIC_1300_LDOS.map(index => [
            ...['LDO', 'Load_switch'].map(mode =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        mode,
                    },
                    {
                        index,
                        append: `set ${index} ${mode === 'LDO' ? '1' : '0'} `,
                        mode,
                    },
                ].flat()
            ),
        ]).flat()
    )('npmx ldsw mode %p', ({ index, append, mode }) => {
        const command = `npmx ldsw mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value:  ${mode === 'LDO' ? '1' : '0'}.`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { mode },
            index,
        });
    });

    test.each(
        PMIC_1300_LDOS.map(index => [
            ...[true, false].map(enabled => [
                {
                    index,
                    append: `get ${index}`,
                    enabled,
                },
                {
                    index,
                    append: `set ${index} ${enabled} `,
                    enabled,
                },
            ]),
        ]).flat()
    )('npmx ldsw soft_start enable %p', ({ index, append, enabled }) => {
        const command = `npmx ldsw soft_start enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}.`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStartEnabled: enabled },
            index,
        });
    });

    test.skip('Need to fix tests for undefined vs NaN', () => {
        test.each(
            PMIC_1300_LDOS.map(index => [
                ...SoftStartValues.map(value => [
                    {
                        index,
                        append: `get ${index}`,
                        value,
                    },
                    {
                        index,
                        append: `set ${index} ${value} `,
                        value,
                    },
                ]),
            ]).flat()
        )('npmx ldsw soft_start current %p', ({ index, append, value }) => {
            const command = `npmx ldsw soft_start current ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value}mA.`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStart: value },
                index,
            });
        });
    });

    test.each(
        PMIC_1300_LDOS.map(index => [
            ...[true, false].map(activeDischarge =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        activeDischarge,
                    },
                    {
                        index,
                        append: `set ${index} ${activeDischarge ? '1' : '0'} `,
                        activeDischarge,
                    },
                ].flat()
            ),
        ]).flat()
    )('npmx ldsw active_discharge %p', ({ index, append, activeDischarge }) => {
        const command = `npmx ldsw active_discharge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${activeDischarge ? '1' : '0'}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { activeDischarge },
            index,
        });
    });

    test.each(
        PMIC_1300_LDOS.map(index => [
            ...[-1, 0, 1, 2, 3, 4].map(value =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        value,
                    },
                    {
                        index,
                        append: `set ${index} ${value} 0`,
                        value,
                    },
                ].flat()
            ),
        ]).flat()
    )('npmx ldsw gpio %p', ({ index, append, value }) => {
        const command = `npmx ldsw gpio index ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value} 0`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: {
                onOffControl:
                    value === -1 ? LdoOnOffControlValues[0] : GPIOValues[value],
                onOffSoftwareControlEnabled: value === -1,
            },
            index,
        });
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
        [true, false]
            .map(enable => [
                {
                    append: `get`,
                    enable,
                },
                {
                    append: `set ${enable ? '1' : '0'}`,
                    enable,
                },
            ])
            .flat()
    )('npmx pof status %p', ({ append, enable }) => {
        const command = `npmx pof status ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enable ? '1' : '0'}.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            enable,
        });
    });

    test.each(
        POFPolarityValues.map((polarity, polarityIndex) => [
            {
                append: `get`,
                polarity,
                polarityIndex,
            },
            {
                append: `set ${polarityIndex}`,
                polarity,
                polarityIndex,
            },
        ]).flat()
    )('npmx pof polarity %p', ({ append, polarity, polarityIndex }) => {
        const command = `npmx pof polarity ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${polarityIndex}.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            polarity,
        });
    });

    test.each([`get`, `set 2800`])('npmx pof threshold %p', append => {
        const command = `npmx pof threshold ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2800.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            threshold: 2.8,
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

    test.each(
        Object.keys(npm1300TimeToActive)
            .map(key => {
                const value =
                    npm1300TimeToActive[
                        key as keyof typeof npm1300TimeToActive
                    ];
                return [
                    { append: `get`, expected: key },
                    { append: `set ${value}`, expected: key },
                ];
            })
            .flat()
    )('npmx ship config time %p', ({ append, expected }) => {
        const command = `npmx ship config time ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected}.`, command);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            timeToActive: expected,
        });
    });

    test.each(
        LongPressResetValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ])
    )('powerup_ship longpress %p', ({ append, value }) => {
        const command = `powerup_ship longpress ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressReset: value,
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
