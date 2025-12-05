/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BatteryModel, FuelGauge } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Command callbacks', () => {
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
            .flat(),
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
            .flat(),
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
        },
    );

    test.each(['get', 'set "Generic_AA"'])('fuel_gauge model %p', append => {
        const command = `fuel_gauge model ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `value: name="Generic_AA",Q={2000.00 mAh}`,
            command,
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
            command,
        );

        expect(mockEnqueueRequest).toBeCalledTimes(2);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            'fuel_gauge model list',
            expect.anything(),
            undefined,
            true,
        );
        expect(mockEnqueueRequest).nthCalledWith(
            2,
            'fuel_gauge model get',
            expect.anything(),
            undefined,
            true,
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
});

export {};
