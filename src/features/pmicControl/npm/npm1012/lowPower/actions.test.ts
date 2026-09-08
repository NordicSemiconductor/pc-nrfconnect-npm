/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { type LowPowerConfig } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - lowPowerModule.actions', () => {
    const { mockOnLowPowerUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();

        mockEnqueueRequest.mockImplementation(
            helpers.registerCommandCallbackSuccess,
        );
    });

    test('enterShipHibernateMode', async () => {
        await pmic.lowPowerModule?.actions.enterShipHibernateMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 low_power_ctrl vbat state set hibernate',
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
    });

    test('enterShipMode', async () => {
        await pmic.lowPowerModule?.actions.enterShipMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 low_power_ctrl ship_mode set on',
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(0);
    });

    test.each([false, true])('enterVbusHibernateMode(%p)', async value => {
        await pmic.lowPowerModule?.actions.enterVbusHibernateMode?.(value);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm1012 low_power_ctrl vbus state set hibernate`,
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).nthCalledWith(1, {
            vbusHibernateWaitingForChargeComplete: value,
        } satisfies Partial<LowPowerConfig>);
    });

    test.each([false, true])('enterVbusStandby1Mode(%p)', async value => {
        await pmic.lowPowerModule?.actions.enterVbusStandby1Mode?.(value);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm1012 low_power_ctrl vbus state set standby1`,
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).nthCalledWith(1, {
            operatingMode: 'vbusStandby1',
            vbusStandbyWaitingForChargeComplete: value,
        } satisfies Partial<LowPowerConfig>);
    });

    test.each([false, true])('enterVbusStandby2Mode(%p)', async value => {
        await pmic.lowPowerModule?.actions.enterVbusStandby2Mode?.(value);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm1012 low_power_ctrl vbus state set standby2`,
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).nthCalledWith(1, {
            operatingMode: 'vbusStandby2',
            vbusStandbyWaitingForChargeComplete: value,
        } satisfies Partial<LowPowerConfig>);
    });

    test('exitVbusStandby1Mode', async () => {
        await pmic.lowPowerModule?.actions.exitVbusStandby1Mode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm1012 low_power_ctrl vbus state set standbyexit`,
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).nthCalledWith(1, {
            operatingMode: 'active',
        } satisfies Partial<LowPowerConfig>);
    });

    test('exitVbusStandby2Mode', async () => {
        await pmic.lowPowerModule?.actions.exitVbusStandby2Mode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm1012 low_power_ctrl vbus state set standbyexit`,
            expect.anything(),
            undefined,
            true,
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).nthCalledWith(1, {
            operatingMode: 'active',
        } satisfies Partial<LowPowerConfig>);
    });
});

export {};
