/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { OnBoardLoad, PmicDialog } from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const { mockDialogHandler, mockOnBoardLoadUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set onBoardLoadModule iLoad', async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.onBoardLoadModule?.set.iLoad(1.5);

        expect(mockOnBoardLoadUpdate).toBeCalledTimes(1);
        expect(mockOnBoardLoadUpdate).toBeCalledWith({
            iLoad: 1.5,
        } satisfies Partial<OnBoardLoad>);
    });
});

export {};
