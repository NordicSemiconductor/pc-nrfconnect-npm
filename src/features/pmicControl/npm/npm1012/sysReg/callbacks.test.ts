/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import { vBusDpmKeys, vBusILimKeys } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnSysRegUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        vBusDpmKeys
            .map(key => [
                { append: `get`, expected: key },
                { append: `set ${key}`, expected: key },
            ])
            .flat(),
    )('npm1012 sysreg vbusdpm %p', ({ append, expected }) => {
        const command = `npm1012 sysreg vbusdpm ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected}`, command);

        expect(mockOnSysRegUpdate).toBeCalledTimes(1);
        expect(mockOnSysRegUpdate).toBeCalledWith({
            vBusDpm: expected,
        });
    });

    test.each(
        vBusILimKeys
            .map(key => [
                { append: `get`, expected: key },
                { append: `set ${key}`, expected: key },
            ])
            .flat(),
    )('npm1012 sysreg vbusilim %p', ({ append, expected }) => {
        const command = `npm1012 sysreg vbusilim ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected}`, command);

        expect(mockOnSysRegUpdate).toBeCalledTimes(1);
        expect(mockOnSysRegUpdate).toBeCalledWith({
            vBusILim: expected,
        });
    });

    test.each([
        {
            value: 'Good,Present',
            expected: { vBusGood: true, vBusPresent: true },
        },
        {
            value: 'Undervoltage',
            expected: { vBusGood: false, vBusPresent: false },
        },
    ])('npm1012 sysreg vbus_status %p', ({ value, expected }) => {
        const command = 'npm1012 sysreg vbus_status get';
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnSysRegUpdate).toBeCalledTimes(1);
        expect(mockOnSysRegUpdate).toBeCalledWith(expected);
    });
});

export {};
