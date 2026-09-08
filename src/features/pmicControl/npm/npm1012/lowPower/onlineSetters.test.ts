/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { type LowPowerConfig, type PmicDialog } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Setters Online tests', () => {
    const {
        mockDialogHandler,
        mockOnLowPowerUpdate,
        mockEnqueueRequest,
        pmic,
    } = setupMocksWithShellParser();

    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each([false, true])(
            'Set hibernateWakeupByButton: %p',
            async value => {
                await pmic.lowPowerModule?.set.hibernateWakeupByButton?.(value);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm1012 low_power_ctrl shphld hibernate_wakeup set ${value ? 'on' : 'off'}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
            },
        );

        test('Set timeToActive %p', async () => {
            await pmic.lowPowerModule?.set.timeToActive('50ms');

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 low_power_ctrl shphld debounce set 50ms',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test.each([false, true])('Set vbusHibernateWait: %p', async value => {
            await pmic.lowPowerModule?.set.vbusHibernateWait?.(value);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 low_power_ctrl vbus hibernate_wait set ${value ? 'on' : 'off'}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
            expect(mockOnLowPowerUpdate).toBeCalledWith({
                vbusHibernateWait: value,
                vbusHibernateWaitingForChargeComplete: false,
            } satisfies Partial<LowPowerConfig>);
        });

        test.each([false, true])('Set vbusStandbyWait: %p', async value => {
            await pmic.lowPowerModule?.set.vbusStandbyWait?.(value);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 low_power_ctrl vbus standby_wait set ${value ? 'on' : 'off'}`,
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
            expect(mockOnLowPowerUpdate).toBeCalledWith({
                vbusStandbyWait: value,
                vbusStandbyWaitingForChargeComplete: false,
            } satisfies Partial<LowPowerConfig>);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });

        test('Set hibernateWakeupByButton - Fail immediately - index: %p', async () => {
            await expect(
                pmic.lowPowerModule?.set.hibernateWakeupByButton?.(true),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 low_power_ctrl shphld hibernate_wakeup set on',
                expect.anything(),
                undefined,
                true,
            );

            // Request update on error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 low_power_ctrl shphld hibernate_wakeup get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test('Set timeToActive - Fail immediately - index: %p', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await expect(
                pmic.lowPowerModule?.set.timeToActive('50ms'),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 low_power_ctrl shphld debounce set 50ms',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 low_power_ctrl shphld debounce get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test('Set vbusHibernateWait - Fail immediately - index: %p', async () => {
            await expect(
                pmic.lowPowerModule?.set.vbusHibernateWait?.(true),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 low_power_ctrl vbus hibernate_wait set on',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 low_power_ctrl vbus hibernate_wait get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });

        test('Set vbusStandbyWait - Fail immediately - index: %p', async () => {
            await expect(
                pmic.lowPowerModule?.set.vbusStandbyWait?.(true),
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                'npm1012 low_power_ctrl vbus standby_wait set on',
                expect.anything(),
                undefined,
                true,
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                'npm1012 low_power_ctrl vbus standby_wait get',
                expect.anything(),
                undefined,
                true,
            );

            expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
        });
    });
});

export {};
