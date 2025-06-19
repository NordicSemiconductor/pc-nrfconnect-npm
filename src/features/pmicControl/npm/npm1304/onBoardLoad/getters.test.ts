/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update onBoardLoad iLoad', () => {
        pmic.onBoardLoadModule?.get.iLoad();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `cc_sink level get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
