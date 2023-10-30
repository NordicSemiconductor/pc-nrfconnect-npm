/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatteryModel,
    BuckModeControlValues,
    BuckOnOffControlValues,
    GPIODriveValues,
    GPIOModeValues,
    GPIOPullValues,
    GPIOValues,
    LdoOnOffControlValues,
    LEDModeValues,
    NTCThermistor,
    PmicChargingState,
    POFPolarityValues,
    SoftStartValues,
    TimerModeValues,
    TimerPrescalerValues,
    TimeToActiveValues,
    USBDetectStatusValues,
} from '../../types';
import {
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const {
        eventHandlers,
        mockOnChargerUpdate,
        mockOnChargingStatusUpdate,
        mockOnFuelGaugeUpdate,
        mockOnActiveBatteryModelUpdate,
        mockEnqueueRequest,
        mockOnStoredBatteryModelUpdate,
        mockOnUsbPower,
        mockOnBuckUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnPOFUpdate,
        mockOnLEDUpdate,
        mockOnTimerConfigUpdate,
        mockOnShipUpdate,
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

    test.each(['get', 'set 2300'])(
        'npmx charger termination_voltage normal %p',
        append => {
            const command = `npmx charger termination_voltage normal ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2300 mv', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 2.3 });
        }
    );

    test.each(['get', 'set 400'])(
        'npmx charger charging_current %p',
        append => {
            const command = `npmx charger charging_current ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 400 mA', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { iChg: 400 });
        }
    );

    test.each(['get', 'set 1'])('npmx charger enable recharging %p', append => {
        const command = `npmx charger module recharge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 1.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            enableRecharging: true,
        });
    });

    test.each(['get', 'set 20'])('npmx charger iTerm %p', append => {
        const command = `npmx charger termination_current ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 20%', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { iTerm: '20%' });
    });

    test.each(['get', 'set 100'])('npmx charger die_temp resume %p', append => {
        const command = `npmx charger die_temp resume ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100 *C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tChgResume: 100,
        });
    });

    test.each(['get', 'set 100'])('npmx charger die_temp stop %p', append => {
        const command = `npmx charger die_temp stop ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100 *C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tChgStop: 100,
        });
    });

    test.each([
        {
            append: 'get',
            successReturn: 'Value: 47000.',
            ntcThermistor: '47 kΩ' as NTCThermistor,
        },
        {
            append: 'set 47000',
            successReturn: 'Value: 47000.',
            ntcThermistor: '47 kΩ' as NTCThermistor,
        },
        {
            append: 'set 10000',
            successReturn: 'Value: 10000.',
            ntcThermistor: '10 kΩ' as NTCThermistor,
        },
        {
            append: 'set 100000',
            successReturn: 'Value: 100000.',
            ntcThermistor: '100 kΩ' as NTCThermistor,
        },
        {
            append: 'set 0',
            successReturn: 'Value: 0.',
            ntcThermistor: 'Ignore NTC' as NTCThermistor,
        },
    ])(
        'npmx charger ntc thermistor %p',
        ({ append, successReturn, ntcThermistor }) => {
            const command = `npmx adc ntc type ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(successReturn, command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { ntcThermistor });
        }
    );

    test.each(['get', 'set 100'])('npmx charger ntc beta %p', append => {
        const command = `npmx adc ntc beta ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            ntcBeta: 100,
        });
    });

    test.each(
        [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
            .map(setValue => [
                {
                    append: 'get',
                    value: setValue,
                },
            ])
            .flat()
    )('npmx charger status %p', ({ append, value }) => {
        const command = `npmx charger status all ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnChargingStatusUpdate).toBeCalledTimes(1);
        expect(mockOnChargingStatusUpdate).toBeCalledWith({
            // eslint-disable-next-line no-bitwise
            batteryDetected: (value & 0x01) > 0,
            // eslint-disable-next-line no-bitwise
            batteryFull: (value & 0x02) > 0,
            // eslint-disable-next-line no-bitwise
            trickleCharge: (value & 0x04) > 0,
            // eslint-disable-next-line no-bitwise
            constantCurrentCharging: (value & 0x08) > 0,
            // eslint-disable-next-line no-bitwise
            constantVoltageCharging: (value & 0x10) > 0,
            // eslint-disable-next-line no-bitwise
            batteryRechargeNeeded: (value & 0x20) > 0,
            // eslint-disable-next-line no-bitwise
            dieTempHigh: (value & 0x40) > 0,
            // eslint-disable-next-line no-bitwise
            supplementModeActive: (value & 0x80) > 0,
        } as PmicChargingState);
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get',
                    enabled,
                },
                {
                    append: `set ${enabled ? '1' : '0'}`,
                    enabled,
                },
            ])
            .flat()
    )('npmx charger module charger %p', ({ append, enabled }) => {
        const command = `npmx charger module charger ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { enabled });
    });

    test.each(['get', 'set 3550'])(
        'npmx charger termination_voltage warm %p',
        append => {
            const command = `npmx charger termination_voltage warm ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 3550 mV', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                vTermR: 3.55,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature cold %p',
        append => {
            const command = `npmx charger ntc_temperature cold ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tCold: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature cool %p',
        append => {
            const command = `npmx charger ntc_temperature cool ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tCool: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature warm %p',
        append => {
            const command = `npmx charger ntc_temperature warm ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tWarm: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature hot %p',
        append => {
            const command = `npmx charger ntc_temperature hot ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tHot: 20,
            });
        }
    );

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
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(enabled);
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
            null,
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
            },
            null,
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
        expect(mockOnStoredBatteryModelUpdate).toBeCalledWith([
            null,
            null,
            null,
        ]);
    });

    test.each(USBDetectStatusValues.map((state, index) => ({ state, index })))(
        'npmx vbusin status cc get %p',
        ({ state, index }) => {
            const command = `npmx vbusin status cc get`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${index}`, command);

            expect(mockOnUsbPower).toBeCalledTimes(1);
            expect(mockOnUsbPower).toBeCalledWith({ detectStatus: state });
        }
    );

    test.each(
        PMIC_1300_BUCKS.map(index => [
            {
                index,
                append: `get ${index}`,
            },
            {
                index,
                append: `set ${index} 2300`,
            },
        ]).flat()
    )('npmx buck voltage normal %p', ({ index, append }) => {
        const command = `npmx buck voltage normal ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 2300 mv', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { vOutNormal: 2.3 },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
            {
                index,
                append: `get ${index}`,
            },
            {
                index,
                append: `set ${index} 2300`,
            },
        ]).flat()
    )('npmx buck voltage retention %p', ({ index, append }) => {
        const command = `npmx buck voltage retention ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 2300 mv', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { vOutRetention: 2.3 },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
            ...[0, 1].map(value =>
                [
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
                ].flat()
            ),
        ]).flat()
    )('npmx buck vout select %p', ({ index, append, value }) => {
        const command = `npmx buck vout select ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: value === 0 ? 'vSet' : 'software' },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
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
    )('npmx buck enable %p', ({ index, append, enabled }) => {
        const command = `npmx buck status power ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
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
    )('npmx buck mode control %p', ({ index, append, value }) => {
        const command = `npmx buck gpio pwm_force ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value} 0.`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                modeControl:
                    value === -1 ? BuckModeControlValues[0] : GPIOValues[value],
            },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
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
    )('npmx buck on/off control %p', ({ index, append, value }) => {
        const command = `npmx buck gpio on_off ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value} 0.`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                onOffControl:
                    value === -1
                        ? BuckOnOffControlValues[0]
                        : GPIOValues[value],
            },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
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
    )('npmx buck retention control %p', ({ index, append, value }) => {
        const command = `npmx buck gpio retention ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value} 0.`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                retentionControl:
                    value === -1
                        ? BuckOnOffControlValues[0]
                        : GPIOValues[value],
            },
            index,
        });
    });

    test.each(
        PMIC_1300_BUCKS.map(index => [
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
    )('npmx buck active_discharge %p', ({ index, append, activeDischarge }) => {
        const command = `npmx buck active_discharge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${activeDischarge ? '1' : '0'}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { activeDischarge },
            index,
        });
    });

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
        const command = `npmx ldsw ${append}`;
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
            ...['LDO', 'ldoSwitch'].map(mode =>
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
        const command = `npmx ldsw gpio ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value} 0`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: {
                onOffControl:
                    value === -1 ? LdoOnOffControlValues[0] : GPIOValues[value],
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
    )('npmx gpio mode %p', ({ index, append, mode, modeIndex }) => {
        const command = `npmx gpio mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${modeIndex}.`, command);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { mode },
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
    )('npmx gpio pull %p', ({ index, append, pull, pullIndex }) => {
        const command = `npmx gpio pull ${append}`;
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
    )('npmx gpio drive %p', ({ index, append, drive }) => {
        const command = `npmx gpio drive ${append}`;
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
    )('npmx gpio debounce %p', ({ index, append, debounce }) => {
        const command = `npmx gpio debounce ${append}`;
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
    )('npmx gpio open_drain %p', ({ index, append, openDrain }) => {
        const command = `npmx gpio open_drain ${append}`;
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
    )('npmx pof enable %p', ({ append, enable }) => {
        const command = `npmx pof enable ${append}`;
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
        TimerModeValues.map((mode, modeIndex) => [
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
        ]).flat()
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

    test.each([`get`, `set 2800`])('npmx timer config period %p', append => {
        const command = `npmx timer config period ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2800.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            period: 2800,
        });
    });

    test.each(
        TimeToActiveValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ])
    )('npmx ship config time %p', ({ append, value }) => {
        const command = `npmx ship config time ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}ms.`, command);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({
            timeToActive: value,
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
    )('npmx ship config inv_polarity %p', ({ append, enable }) => {
        const command = `npmx ship config inv_polarity ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enable ? '1' : '0'}.`, command);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({
            invPolarity: enable,
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
    )('npmx ship reset long_press %p', ({ append, enable }) => {
        const command = `npmx ship reset long_press ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enable ? '1' : '0'}.`, command);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({
            longPressReset: enable,
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
    )('npmx ship reset two_buttons %p', ({ append, enable }) => {
        const command = `npmx ship reset two_buttons ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enable ? '1' : '0'}.`, command);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({
            twoButtonReset: enable,
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
