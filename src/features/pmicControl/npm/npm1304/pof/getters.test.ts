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

    test('Request update pofEnable', () => {
        pmic.pofModule?.get.enable();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof status get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update pofPolarity', () => {
        pmic.pofModule?.get.polarity();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof polarity get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update pofThreshold', () => {
        pmic.pofModule?.get.threshold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof threshold get`,
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
