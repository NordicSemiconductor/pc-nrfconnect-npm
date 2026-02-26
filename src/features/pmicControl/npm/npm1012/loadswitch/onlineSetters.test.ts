/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import {
    PMIC_1012_LOADSWITCHES,
    setupMocksWithShellParser,
} from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const { mockOnLoadSwitchUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch activeDischarge index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.activeDischarge(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw activedischarge set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch enable index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.enable(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw enable set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch onOffControl index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.onOffControl('GPIO');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw enablectrl set 1 GPIO',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch overCurrentProtection index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.overCurrentProtection(
                    true,
                );

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw ocp set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch softStartCurrentLimit index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.softStartCurrentLimit(
                    10,
                );

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw softstartilim set 1 10',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch softStartTime index: %p',
            async index => {
                await pmic.loadSwitchModule[index].set.softStartTime(4.5);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw softstarttime set 1 4.5',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch activeDischarge error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.activeDischarge(true),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw activedischarge set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw activedischarge get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch enable error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.enable(true),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw enable set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw enable get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch onOffControl error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.onOffControl('GPIO'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw enablectrl set 1 GPIO',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw enablectrl get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch overCurrentProtection error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.overCurrentProtection(
                        true,
                    ),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw ocp set 1 ON',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw ocp get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch softStartCurrentLimit error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.softStartCurrentLimit(0),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw softstartilim set 1 DISABLE',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw softstartilim get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1012_LOADSWITCHES)(
            'Set LoadSwitch softStartTime error - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.loadSwitchModule[index].set.softStartTime(0),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    'npm1012 ldosw softstarttime set 1 DISABLE',
                    expect.anything(),
                    undefined,
                    true,
                );
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    'npm1012 ldosw softstarttime get 1',
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockOnLoadSwitchUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
