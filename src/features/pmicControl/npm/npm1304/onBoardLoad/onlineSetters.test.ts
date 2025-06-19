/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnBoardLoadUpdate,
        mockEnqueueRequest,
        pmic,
    } = setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test('Set onBoardLoadModule iLoad', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.onBoardLoadModule?.set.iLoad(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `cc_sink level set 1`,
                expect.anything(),
                undefined,
                true
            );

            expect(mockOnBoardLoadUpdate).toBeCalledTimes(1);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test('Set onBoardLoadModule iLoad onError case 1  - Fail immediately', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.onBoardLoadModule?.set.iLoad(1)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `cc_sink level set 1`,
                expect.anything(),
                undefined,
                true
            );

            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `cc_sink level get`,
                expect.anything(),
                undefined,
                true
            );

            expect(mockOnBoardLoadUpdate).toBeCalledTimes(1);
        });
    });
});

export {};
