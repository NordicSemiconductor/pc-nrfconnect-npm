/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type LowPowerConfig } from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnLowPowerUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set hibernateWakeupByButton', async () => {
        await pmic.lowPowerModule?.set.hibernateWakeupByButton?.(true);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            hibernateWakeupByButton: true,
        } satisfies Partial<LowPowerConfig>);
    });

    test('Set timeToActive', async () => {
        await pmic.lowPowerModule?.set.timeToActive('50ms');

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({ timeToActive: '50ms' });
    });

    test('Set vbusHibernateWait', async () => {
        await pmic.lowPowerModule?.set.vbusHibernateWait?.(true);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            vbusHibernateWait: true,
            vbusHibernateWaitingForChargeComplete: false,
        } satisfies Partial<LowPowerConfig>);
    });

    test('Set vbusStandbyWait', async () => {
        await pmic.lowPowerModule?.set.vbusStandbyWait?.(true);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            vbusStandbyWait: true,
            vbusStandbyWaitingForChargeComplete: false,
        } satisfies Partial<LowPowerConfig>);
    });
});

export {};
