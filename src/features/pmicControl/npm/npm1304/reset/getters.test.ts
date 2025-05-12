/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update shipLongPressReset', () => {
        pmic.resetModule?.get.longPressReset();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `powerup_ship longpress get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
