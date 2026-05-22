/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnSysRegUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set sysReg vBusDpm', async () => {
        await pmic.sysRegModule?.set.vBusDpm('4.35V');

        expect(mockOnSysRegUpdate).toBeCalledTimes(1);
        expect(mockOnSysRegUpdate).toBeCalledWith({ vBusDpm: '4.35V' });
    });

    test('Set sysReg vBusILim', async () => {
        await pmic.sysRegModule?.set.vBusILim('225mA');

        expect(mockOnSysRegUpdate).toBeCalledTimes(1);
        expect(mockOnSysRegUpdate).toBeCalledWith({ vBusILim: '225mA' });
    });
});

export {};
