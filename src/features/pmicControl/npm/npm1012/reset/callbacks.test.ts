/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import {
    longPressResetDebounceValues,
    longPressResetPinSelValues,
    powerDownWaitValues,
} from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const {
        eventHandlers,

        mockOnResetUpdate,
    } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        longPressResetDebounceValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ]),
    )(
        'npm1012 reset_ctrl long_press_reset debounce %p',
        ({ append, value }) => {
            const command = `npm1012 reset_ctrl long_press_reset debounce ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value}`, command);

            expect(mockOnResetUpdate).toBeCalledTimes(1);
            expect(mockOnResetUpdate).toBeCalledWith({
                longPressResetDebounce: value,
            });
        },
    );

    test.each(
        [true, false].map(value => [
            { append: `get`, value },
            { append: `set ${value ? 'on' : 'off'}`, value },
        ]),
    )('npm1012 reset_ctrl long_press_reset enable %p', ({ append, value }) => {
        const command = `npm1012 reset_ctrl long_press_reset enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value ? 'on' : 'off'}`, command);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetEnable: value,
        });
    });

    test.each(
        longPressResetPinSelValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ]),
    )('npm1012 reset_ctrl long_press_reset pinsel %p', ({ append, value }) => {
        const command = `npm1012 reset_ctrl long_press_reset pinsel ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressResetPinSel: value,
        });
    });

    test.each(
        powerDownWaitValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ]),
    )('npm1012 reset_ctrl powerdown_wait %p', ({ append, value }) => {
        const command = `npm1012 reset_ctrl powerdown_wait ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            powerDownWait: value,
        });
    });
});
export {};
