/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { POFPolarityValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Command callbacks', () => {
    const { eventHandlers, mockOnPOFUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        [true, false]
            .map(enable => [
                {
                    append: `get`,
                    enable,
                },
                {
                    append: `set ${enable ? '1' : '0'}`,
                    enable,
                },
            ])
            .flat()
    )('npmx pof status %p', ({ append, enable }) => {
        const command = `npmx pof status ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enable ? '1' : '0'}.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            enable,
        });
    });

    test.each(
        POFPolarityValues.map((polarity, polarityIndex) => [
            {
                append: `get`,
                polarity,
                polarityIndex,
            },
            {
                append: `set ${polarityIndex}`,
                polarity,
                polarityIndex,
            },
        ]).flat()
    )('npmx pof polarity %p', ({ append, polarity, polarityIndex }) => {
        const command = `npmx pof polarity ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${polarityIndex}.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            polarity,
        });
    });

    test.each([`get`, `set 2800`])('npmx pof threshold %p', append => {
        const command = `npmx pof threshold ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2800.`, command);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({
            threshold: 2.8,
        });
    });
});
export {};
