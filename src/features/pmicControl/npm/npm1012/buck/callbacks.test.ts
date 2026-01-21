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
            data: { enabled: true, onOffControl: 'Software' },
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
        PMIC_1012_BUCKS.map(index =>
            ['lp', 'ulp']
                .map(mode =>
                    [
                        {
                            index,
                            append: `${mode} get`,
                        },
                        {
                            index,
                            append: `${mode} set 2.5`,
                        },
                    ].flat(),
                )
                .flat(),
        ).flat(),
    )('npm1012 buck bias %p', ({ index, append }) => {
        const command = `npm1012 buck bias ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2.5`, command);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: {
                vOutComparatorBiasCurrent: 2.5,
            },
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
