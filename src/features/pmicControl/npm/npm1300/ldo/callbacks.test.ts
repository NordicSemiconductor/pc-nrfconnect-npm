/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { GPIOValues, LdoOnOffControlValues } from '../../types';
import { PMIC_1300_LDOS, setupMocksWithShellParser } from '../tests/helpers';
import { SoftStartValues } from './types';

describe('PMIC 1300 - Command callbacks', () => {
    const { eventHandlers, mockOnLdoUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
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
                ].flat(),
            ),
        ]).flat(),
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
        ]).flat(),
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
                ].flat(),
            ),
        ]).flat(),
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
        ]).flat(),
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
            ]).flat(),
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
                ].flat(),
            ),
        ]).flat(),
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
                ].flat(),
            ),
        ]).flat(),
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
});
export {};
