/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import { onOffControlValues } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnLoadSwitchUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get 1',
                    enabled,
                },
                {
                    append: `set 1 ${enabled ? 'on' : 'off'}`,
                    enabled,
                },
            ])
            .flat(),
    )('npm1012 ldosw activedischarge %p', ({ append, enabled }) => {
        const command = `npm1012 ldosw activedischarge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { activeDischarge: enabled },
            index: 0,
        });
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get 1',
                    enabled,
                },
                {
                    append: `set 1 ${enabled ? 'on' : 'off'}`,
                    enabled,
                },
            ])
            .flat(),
    )('npm1012 ldosw enable %p', ({ append, enabled }) => {
        const command = `npm1012 ldosw enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { enable: enabled },
            index: 0,
        });
    });

    test.each(
        onOffControlValues
            .map(value => [
                {
                    append: 'get 1',
                    value,
                },
                {
                    append: `set 1 ${value}`,
                    value,
                },
            ])
            .flat(),
    )('npm1012 ldosw enablectrl %p', ({ append, value }) => {
        const command = `npm1012 ldosw enablectrl ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { onOffControl: value },
            index: 0,
        });
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get 1',
                    enabled,
                },
                {
                    append: `set 1 ${enabled ? 'on' : 'off'}`,
                    enabled,
                },
            ])
            .flat(),
    )('npm1012 ldosw ocp %p', ({ append, enabled }) => {
        const command = `npm1012 ldosw ocp ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { overCurrentProtection: enabled },
            index: 0,
        });
    });

    test.each(
        [0, 10]
            .map(value => [
                {
                    append: 'get 1',
                    value,
                },
                {
                    append: `set 1 ${value === 0 ? 'disabled' : value}`,
                    value,
                },
            ])
            .flat(),
    )('npm1012 ldosw softstartilim %p', ({ append, value }) => {
        const command = `npm1012 ldosw softstartilim ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `Value: ${value === 0 ? 'disabled' : value}`,
            command,
        );

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { softStartCurrentLimit: value },
            index: 0,
        });
    });

    test.each(
        [0, 4.5]
            .map(value => [
                {
                    append: 'get 1',
                    value,
                },
                {
                    append: `set 1 ${value === 0 ? 'disabled' : value}`,
                    value,
                },
            ])
            .flat(),
    )('npm1012 ldosw softstarttime %p', ({ append, value }) => {
        const command = `npm1012 ldosw softstarttime ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `Value: ${value === 0 ? 'disabled' : value}`,
            command,
        );

        expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
        expect(mockOnLoadSwitchUpdate).toBeCalledWith({
            data: { softStartTime: value },
            index: 0,
        });
    });
});
export {};
