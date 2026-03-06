/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_BUCKS, setupMocksWithShellParser } from '../tests/helpers';
import {
    BuckModeControlValues1012,
    BuckVOutRippleControlValues1012,
} from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnBuckUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get 0`,
            },
            {
                index,
                append: `set 0 2.35V`,
            },
        ]).flat(),
    )('npm1012 buck software %p', ({ index, append }) => {
        const command = `npm1012 buck vout software ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 2.35V', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { vOutNormal: 2.35 },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get 1`,
            },
            {
                index,
                append: `set 1 2.35V`,
            },
        ]).flat(),
    )('npm1012 buck software %p', ({ index, append }) => {
        const command = `npm1012 buck vout software ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 2.35V', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { alternateVOut: 2.35 },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set VOUT2`,
            },
        ]).flat(),
    )('npm1012 buck voutsel %p', ({ index, append }) => {
        const command = `npm1012 buck voutsel ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: VOUT2`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { alternateVOutControl: 'Software' },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set software`,
            },
        ]).flat(),
    )('npm1012 buck voutselctrl %p', ({ index, append }) => {
        const command = `npm1012 buck voutselctrl ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: SOFTWARE`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set ON`,
            },
        ]).flat(),
    )('npm1012 buck enable %p', ({ index, append }) => {
        const command = `npm1012 buck enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ON`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: true },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set SOFTWARE`,
            },
        ]).flat(),
    )('npm1012 buck enablectrl %p', ({ index, append }) => {
        const command = `npm1012 buck enablectrl ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: SOFTWARE`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { onOffControl: 'Software' },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index =>
            BuckModeControlValues1012.map(value =>
                [
                    {
                        index,
                        append: `get`,
                        value,
                    },
                    {
                        index,
                        append: `set ${value}`,
                        value,
                    },
                ].flat(),
            ).flat(),
        ).flat(),
    )('npm1012 buck pwrmode %p', ({ index, append, value }) => {
        const command = `npm1012 buck pwrmode ${append}`;
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
        PMIC_1012_BUCKS.map(index =>
            [
                { in: 'DISABLE', out: 0 },
                { in: 250, out: 250 },
            ]
                .map(value =>
                    [
                        {
                            index,
                            append: `get`,
                            value,
                        },
                        {
                            index,
                            append: `set ${value.in}`,
                            value,
                        },
                    ].flat(),
                )
                .flat(),
        ).flat(),
    )('npm1012 buck pulldown %p', ({ index, append, value }) => {
        const command = `npm1012 buck pulldown ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value.in}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                activeDischargeResistance: value.out,
            },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set ON`,
            },
        ]).flat(),
    )('npm1012 buck passthrough %p', ({ index, append }) => {
        const command = `npm1012 buck passthrough ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: ON', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { automaticPassthrough: true },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set 142mA`,
            },
        ]).flat(),
    )('npm1012 buck peakilim %p', ({ index, append }) => {
        const command = `npm1012 buck peakilim ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 142mA', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { peakCurrentLimit: 142 },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set ON`,
            },
        ]).flat(),
    )('npm1012 buck autopull %p', ({ index, append }) => {
        const command = `npm1012 buck autopull ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: ON', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { quickVOutDischarge: true },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set ON`,
            },
        ]).flat(),
    )('npm1012 buck scprotect %p', ({ index, append }) => {
        const command = `npm1012 buck scprotect ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: ON', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { shortCircuitProtection: true },
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                append: `get`,
            },
            {
                index,
                append: `set 142mA`,
            },
        ]).flat(),
    )('npm1012 buck softstartilim %p', ({ index, append }) => {
        const command = `npm1012 buck softstartilim ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 142mA', command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { softStartPeakCurrentLimit: 142 },
            index,
        });
    });

    const vOutComparatorBiasCurrentTestArgs = [
        {
            mode: 'LP',
            value: 1.4,
            expected: { vOutComparatorBiasCurrentLPMode: 1.4 },
        },
        {
            mode: 'ULP',
            value: 28,
            expected: { vOutComparatorBiasCurrentULPMode: 28 },
        },
    ]
        .map(args => [
            {
                cmd: 'get',
                mode: args.mode,
                value: args.value,
                expected: args.expected,
            },
            {
                cmd: `set ${args.value}`,
                mode: args.mode,
                value: args.value,
                expected: args.expected,
            },
        ])
        .flat();

    test.each(
        PMIC_1012_BUCKS.map(index =>
            vOutComparatorBiasCurrentTestArgs.map(test => ({
                index,
                test,
            })),
        ).flat(),
    )('npm1012 buck bias %p', ({ index, test }) => {
        const command = `npm1012 buck bias ${test.mode.toLowerCase()} ${test.cmd}`;

        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${test.value}mA`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: test.expected,
            index,
        });
    });

    test.each(
        PMIC_1012_BUCKS.map(index =>
            BuckVOutRippleControlValues1012.map(value =>
                [
                    {
                        index,
                        append: `get`,
                        value,
                    },
                    {
                        index,
                        append: `set ${value}`,
                        value,
                    },
                ].flat(),
            ).flat(),
        ).flat(),
    )('npm1012 buck ripple %p', ({ index, append, value }) => {
        const command = `npm1012 buck ripple ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                vOutRippleControl: value,
            },
            index,
        });
    });
});

export {};
