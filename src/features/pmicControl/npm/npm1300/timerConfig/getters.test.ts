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

    test('Request update timerConfigMode', () => {
        pmic.timerConfigModule?.get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config mode get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPrescaler', () => {
        pmic.timerConfigModule?.get.prescaler!();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config prescaler get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPeriod', () => {
        pmic.timerConfigModule?.get.period();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config compare get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
