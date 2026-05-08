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

    test('Request update hibernateWakeupByButton', () => {
        pmic.lowPowerModule?.get.hibernateWakeupByButton?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 low_power_ctrl shphld hibernate_wakeup get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update shipModeTimeToActive', () => {
        pmic.lowPowerModule?.get.timeToActive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 low_power_ctrl shphld debounce get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update vbusHibernateWait', () => {
        pmic.lowPowerModule?.get.vbusHibernateWait?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 low_power_ctrl vbus hibernate_wait get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update vbusStandbyWait', () => {
        pmic.lowPowerModule?.get.vbusStandbyWait?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 low_power_ctrl vbus standby_wait get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update vbusStatus', () => {
        pmic.lowPowerModule?.get.vbusStatus?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 low_power_ctrl vbus status get`,
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
