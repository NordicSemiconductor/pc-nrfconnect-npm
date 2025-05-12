/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm1300TimerMode } from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const { mockOnTimerConfigUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set set timer config mode ', async () => {
        await pmic.timerConfigModule?.set.mode(npm1300TimerMode['Wake-up']);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm1300TimerMode['Wake-up'],
        });
    });

    test('Set set timer config prescaler ', async () => {
        await pmic.timerConfigModule?.set.prescaler!('Fast');

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({ prescaler: 'Fast' });
    });

    test('Set set ship config compare ', async () => {
        await pmic.timerConfigModule?.set.period(1000);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({ period: 1000 });
    });
});

export {};
