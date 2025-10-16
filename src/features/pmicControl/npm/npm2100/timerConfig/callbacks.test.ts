/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import { npm2100TimerMode } from '../types';

describe('PMIC 2100 - Command callbacks', () => {
    const { eventHandlers, mockOnTimerConfigUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
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
            .flat()
    )('npm2100 timer mode %p', ({ append, mode }) => {
        const command = `npm2100 timer mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            `${append === 'get' ? 'Value:' : 'Value:'} ${
                npm2100TimerMode[mode as keyof typeof npm2100TimerMode]
            }.`,
            command
        );

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm2100TimerMode[mode as keyof typeof npm2100TimerMode],
        });
    });
});

export {};
