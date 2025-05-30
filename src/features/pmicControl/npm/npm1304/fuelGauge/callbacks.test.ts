/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryModel, FuelGauge } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Command callbacks', () => {
    const {
        eventHandlers,
        mockOnFuelGaugeUpdate,
        mockOnActiveBatteryModelUpdate,
        mockEnqueueRequest,
        mockOnStoredBatteryModelUpdate,
    } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
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
});
export {};
