/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BuckOnOffControlValues, GPIOValues } from '../../types';
import { PMIC_1300_BUCKS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const { eventHandlers, mockOnBuckUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
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
        const command = `npmx buck vout_select ${append}`;
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
        const command = `npmx buck status ${append}`;
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
            ...[
                'Auto',
                'PWM',
                'PFM',
                'GPIO0',
                'GPIO1',
                'GPIO2',
                'GPIO3',
                'GPIO4',
            ].map(value =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        value,
                    },
                    {
                        index,
                        append: `set ${index} ${value}`,
                        value,
                    },
                ].flat()
            ),
        ]).flat()
    )('npmx buck mode control %p', ({ index, append, value }) => {
        const command = `powerup_buck mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                modeControl: value,
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
        const command = `npmx buck gpio on_off index ${append}`;
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
                onOffSoftwareControlEnabled: value === -1,
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
        const command = `npmx buck gpio retention index ${append}`;
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
});
export {};
