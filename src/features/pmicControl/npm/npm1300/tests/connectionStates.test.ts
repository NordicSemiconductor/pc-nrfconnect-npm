/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from './helpers';

describe('PMIC 1300 - Pmic State Change tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('Initial State', () => {
        const { pmic } = setupMocksWithShellParser();

        expect(pmic.pmicState).toBe('pmic-connected');
    });

    test("Goes from 'pmic-connected' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
        const { eventHandlers, mockOnPmicStateChange } =
            setupMocksWithShellParser();

        eventHandlers.mockOnShellLoggingEventHandler(
            '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
        );

        expect(mockOnPmicStateChange).toBeCalledTimes(1);
        expect(mockOnPmicStateChange).toBeCalledWith('pmic-disconnected');
    });

    test("Goes from 'pmic-unknown' to 'pmic-disconnected' if 'No response from PMIC.' is received", () => {
        const { eventHandlers, mockOnPmicStateChange } =
            setupMocksWithShellParser();

        eventHandlers.mockOnShellLoggingEventHandler(
            '[00:00:02.019,531] <wrn> module_pmic: No response from PMIC.'
        );

        expect(mockOnPmicStateChange).toBeCalledTimes(1);
        expect(mockOnPmicStateChange).toBeCalledWith('pmic-disconnected');
    });

    test('Request kernelReset %p', () => {
        const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

        mockEnqueueRequest.mockClear();

        pmic.kernelReset();
        pmic.kernelReset(); // this should not be sent

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `delayed_reboot 100`,
            expect.anything(),
            undefined,
            true
        );
    });
});
export {};
