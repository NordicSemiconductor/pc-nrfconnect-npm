/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LongPressResetValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Command callbacks', () => {
    const {
        eventHandlers,

        mockOnResetUpdate,
    } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        LongPressResetValues.map(value => [
            { append: `get`, value },
            { append: `set ${value}`, value },
        ]),
    )('powerup_ship longpress %p', ({ append, value }) => {
        const command = `powerup_ship longpress ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressReset: value,
        });
    });
});
export {};
