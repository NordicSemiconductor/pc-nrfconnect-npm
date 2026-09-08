/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import { modeValues } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnTimerConfigUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        modeValues
            .map((mode, modeIndex) => [
                {
                    append: `get`,
                    mode,
                    modeIndex,
                },
                {
                    append: `set ${mode}`,
                    mode,
                    modeIndex,
                },
            ])
            .flat(),
    )('npm1012 timer mode %p', ({ append, mode }) => {
        const command = `npm1012 timer mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${mode}.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode,
        });
    });

    test.each([`get`, `set 2.8`])('npm1012 timer period %p', append => {
        const command = `npm1012 timer period ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2.8`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            period: 2800,
        });
    });
});
export {};
