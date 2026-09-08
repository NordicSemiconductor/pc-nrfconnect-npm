/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update timerConfigMode', () => {
        pmic.timerConfigModule?.get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 timer mode get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update timerConfigPeriod', () => {
        pmic.timerConfigModule?.get.period();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 timer period get`,
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
