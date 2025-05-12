/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm1300TimeToActive } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Command callbacks', () => {
    const { eventHandlers, mockOnReboot, mockOnLowPowerUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        Object.keys(npm1300TimeToActive)
            .map(key => {
                const value =
                    npm1300TimeToActive[
                        key as keyof typeof npm1300TimeToActive
                    ];
                return [
                    { append: `get`, expected: key },
                    { append: `set ${value}`, expected: key },
                ];
            })
            .flat()
    )('npmx ship config time %p', ({ append, expected }) => {
        const command = `npmx ship config time ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected}.`, command);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            timeToActive: expected,
        });
    });

    test.each(['ship', 'hibernate'])('npmx ship mode %p', mode => {
        const command = `npmx ship mode  ${mode}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${mode}.`, command);

        expect(mockOnReboot).toBeCalledTimes(1);
        expect(mockOnReboot).toBeCalledWith(true);
    });
});
export {};
