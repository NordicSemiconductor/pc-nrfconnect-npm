/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { OnBoardLoad } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - onBordLoad  Command callbacks', () => {
    const { eventHandlers, mockOnBoardLoadUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each([
        {
            mode: `get`,
            value: 10.0,
        },
        {
            mode: `set`,
            value: 10.0,
        },
    ])('cc_sink level %p', ({ mode, value }) => {
        const command = `cc_sink level ${mode} ${value}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnBoardLoadUpdate).toBeCalledTimes(1);
        expect(mockOnBoardLoadUpdate).toBeCalledWith({
            iLoad: value,
        } satisfies Partial<OnBoardLoad>);
    });
});
export {};
