/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    PMIC_1012_LOADSWITCHES,
    setupMocksWithShellParser,
} from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch activeDischarge: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.activeDischarge?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw activedischarge get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch enable: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.enable?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw enable get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch onOffControl: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.onOffControl?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw enablectrl get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch overCurrentProtection: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.overCurrentProtection?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw ocp get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch softStartCurrentLimit: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.softStartCurrentLimit?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstartilim get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LOADSWITCHES)(
        'Request update loadSwitch softStartTime: %p',
        index => {
            pmic.loadSwitchModule[index]?.get.softStartTime?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstarttime get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );
});

export {};
