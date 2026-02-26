/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_LOADSWITCHES, setupMocksBase } from '../tests/helpers';

describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnLoadSwitchUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch activeDischarge index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.activeDischarge(true);

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { activeDischarge: true },
                index,
            });
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch enable index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.enable(true);

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { enable: true },
                index,
            });
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch onOffControl index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.onOffControl('GPIO');

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { onOffControl: 'GPIO' },
                index,
            });
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch overCurrentProtection index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.overCurrentProtection(true);

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { overCurrentProtection: true },
                index,
            });
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch softStartCurrentLimit index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.softStartCurrentLimit(10);

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { softStartCurrentLimit: 10 },
                index,
            });
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Set LoadSwitch softStartTime index: %p',
        async index => {
            await pmic.loadSwitchModule[index].set.softStartTime(4.5);

            expect(mockOnLoadSwitchUpdate).toBeCalledTimes(1);
            expect(mockOnLoadSwitchUpdate).toBeCalledWith({
                data: { softStartTime: 4.5 },
                index,
            });
        },
    );
});

export {};
