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

    test('Request update vBusinCurrentLimiter', () => {
        pmic.usbCurrentLimiterModule?.get.vBusInCurrentLimiter();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx vbusin current_limit get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update usbPowered', () => {
        pmic.usbCurrentLimiterModule?.get.usbPowered();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `powerup_vbusin status get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
