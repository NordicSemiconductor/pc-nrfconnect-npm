/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update shipModeTimeToActive', () => {
        pmic.lowPowerModule?.get.timeToActive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship config time get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request enterShipMode ship', () => {
        pmic.lowPowerModule?.actions.enterShipMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode ship`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request enterShipMode hibernate', () => {
        pmic.lowPowerModule?.actions.enterShipHibernateMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode hibernate`,
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
