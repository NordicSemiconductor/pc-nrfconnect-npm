/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnSysRegUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test('Set sysReg vBusDpm', async () => {
            await pmic.sysRegModule?.set.vBusDpm('4.35V');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 sysreg vbusdpm set 4.35V',
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnSysRegUpdate).toBeCalledTimes(0);
        });

        test('Set sysReg vBusILim', async () => {
            await pmic.sysRegModule?.set.vBusILim('225mA');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 sysreg vbusilim set 225mA',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnSysRegUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set sysReg vBusDpm - Fail immediately', async () => {
            await expect(
                pmic.sysRegModule?.set.vBusDpm('4.35V'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 sysreg vbusdpm set 4.35V',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 sysreg vbusdpm get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnSysRegUpdate).toBeCalledTimes(0);
        });

        test('Set sysReg vBusILim - Fail immediately', async () => {
            await expect(
                pmic.sysRegModule?.set.vBusILim('225mA'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 sysreg vbusilim set 225mA',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 sysreg vbusilim get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnSysRegUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
