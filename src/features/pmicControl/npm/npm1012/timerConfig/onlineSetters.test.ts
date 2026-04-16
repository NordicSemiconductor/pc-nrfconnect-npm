/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { setupMocksWithShellParser } from '../tests/helpers';
import { modeKeys } from './types';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnTimerConfigUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(
            modeKeys.map((mode, index) => ({
                mode,
                index,
            })),
        )('Set timer mode %p', async ({ mode }) => {
            await pmic.timerConfigModule?.set.mode(mode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 timer mode set ${mode}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });

        test('Set timer period %p', async () => {
            await pmic.timerConfigModule?.set.period(1500);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 timer period set 1.5`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(
            modeKeys.map((mode, index) => ({
                mode,
                index,
            })),
        )('Set timer mode - Fail immediately - index: %p', async ({ mode }) => {
            await expect(
                pmic.timerConfigModule?.set.mode(mode),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 timer mode set ${mode}`,
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm1012 timer mode get`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });

        test('Set timer period - Fail immediately - index: %p', async () => {
            await expect(
                pmic.timerConfigModule?.set.period(1500),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 timer period set 1.5`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm1012 timer period get`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnTimerConfigUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
