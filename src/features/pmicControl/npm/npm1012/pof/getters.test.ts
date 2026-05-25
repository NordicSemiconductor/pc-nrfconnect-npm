/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update pof resetThreshold', () => {
        pmic.pofModule?.get.resetThreshold?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 reset_ctrl pof reset_threshold get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update pof status', () => {
        pmic.pofModule?.get.status?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 reset_ctrl pof status get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update pof warnThreshold', () => {
        pmic.pofModule?.get.warnThreshold?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 reset_ctrl pof warn_threshold get',
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
