/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm1300TimerMode, TimerPrescalerValues } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Command callbacks', () => {
    const { eventHandlers, mockOnTimerConfigUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        Object.keys(npm1300TimerMode)
            .map((mode, modeIndex) => [
                {
                    append: `get`,
                    mode,
                    modeIndex,
                },
                {
                    append: `set ${modeIndex}`,
                    mode,
                    modeIndex,
                },
            ])
            .flat()
    )('npmx timer config mode %p', ({ append, mode, modeIndex }) => {
        const command = `npmx timer config mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${modeIndex}.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode,
        });
    });

    test.each(
        TimerPrescalerValues.map((prescaler, prescalerIndex) => [
            {
                append: `get`,
                prescaler,
                prescalerIndex,
            },
            {
                append: `set ${prescalerIndex}`,
                prescaler,
                prescalerIndex,
            },
        ]).flat()
    )(
        'npmx timer config prescaler %p',
        ({ append, prescaler, prescalerIndex }) => {
            const command = `npmx timer config prescaler ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${prescalerIndex}.`, command);

            expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
            expect(mockOnTimerConfigUpdate).toBeCalledWith({
                prescaler,
            });
        }
    );

    test.each([`get`, `set 2800`])('npmx timer config compare %p', append => {
        const command = `npmx timer config compare ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 2800.`, command);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            period: 2800,
        });
    });
});
export {};
