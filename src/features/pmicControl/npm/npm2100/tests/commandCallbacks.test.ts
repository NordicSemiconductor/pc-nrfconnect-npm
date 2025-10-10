/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm2100TimerMode } from '../types';
import { setupMocksWithShellParser } from './helpers';

describe('PMIC 2100 - Command callbacks', () => {
    const { eventHandlers, mockOnTimerConfigUpdate, mockOnReboot } =
        setupMocksWithShellParser();

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

    test.each(
        Object.keys(npm2100TimerMode)
            .map(mode => [
                {
                    append: `get`,
                    mode,
                },
                {
                    append: `set ${
                        npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
                    }`,
                    mode,
                },
            ])
            .flat(),
    )('npm2100 timer mode %p', ({ append, mode }) => {
        const command = `npm2100 timer mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `${append === 'get' ? 'Value:' : 'Value:'} ${
                npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
            }.`,
            command,
        );

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm2100TimerMode[mode as keyof typeof npm2100TimerMode],
        });
    });
});

export {};
