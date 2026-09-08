/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type LowPowerConfig } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';
import { timeToActiveKeys } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnReboot, mockOnLowPowerUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        [false, true]
            .map(value => [
                { append: 'get', expected: value },
                { append: `set ${value ? 'on' : 'off'}`, expected: value },
            ])
            .flat(),
    )(
        'npm1012 low_power_ctrl shphld hibernate_wakeup %p',
        ({ append, expected }) => {
            const command = `npm1012 low_power_ctrl shphld hibernate_wakeup ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${expected ? 'on' : 'off'}`, command);

            expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
            expect(mockOnLowPowerUpdate).toBeCalledWith({
                hibernateWakeupByButton: expected,
            } satisfies Partial<LowPowerConfig>);
        },
    );

    test.each(
        timeToActiveKeys
            .map(key => [
                { append: `get`, expected: key },
                { append: `set ${key}`, expected: key },
            ])
            .flat(),
    )('npm1012 low_power_ctrl shphld debounce %p', ({ append, expected }) => {
        const command = `npm1012 low_power_ctrl shphld debounce ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected}`, command);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            timeToActive: expected,
        });
    });

    test.each(['ship_mode set on', 'vbat state set hibernate'])(
        'npm1012 low_power_ctrl %p',
        mode => {
            const command = `npm1012 low_power_ctrl ${mode}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${mode}`, command);

            expect(mockOnReboot).toBeCalledTimes(1);
            expect(mockOnReboot).toBeCalledWith(true);
        },
    );

    test.each(
        [false, true]
            .map(value => [
                { append: 'get', expected: value },
                { append: `set ${value ? 'on' : 'off'}`, expected: value },
            ])
            .flat(),
    )(
        'npm1012 low_power_ctrl vbus hibernate_wait %p',
        ({ append, expected }) => {
            const command = `npm1012 low_power_ctrl vbus hibernate_wait ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${expected ? 'on' : 'off'}`, command);

            expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
            expect(mockOnLowPowerUpdate).toBeCalledWith({
                vbusHibernateWait: expected,
            } satisfies Partial<LowPowerConfig>);
        },
    );

    test.each(
        [false, true]
            .map(value => [
                { append: 'get', expected: value },
                { append: `set ${value ? 'on' : 'off'}`, expected: value },
            ])
            .flat(),
    )('npm1012 low_power_ctrl vbus standby_wait %p', ({ append, expected }) => {
        const command = `npm1012 low_power_ctrl vbus standby_wait ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${expected ? 'on' : 'off'}`, command);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({
            vbusStandbyWait: expected,
        } satisfies Partial<LowPowerConfig>);
    });

    test.each([
        {
            expected: {
                vbusHibernateWaitingForChargeComplete: false,
                vbusStandbyWaitingForChargeComplete: false,
            } satisfies Partial<LowPowerConfig>,
            response: 'No_request',
        },
        {
            expected: {
                vbusHibernateWaitingForChargeComplete: true,
                vbusStandbyWaitingForChargeComplete: true,
            } satisfies Partial<LowPowerConfig>,
            response: 'Hibernate_waiting,Standby_waiting',
        },
    ])('npm1012 low_power_ctrl vbus status %p', ({ expected, response }) => {
        const command = `npm1012 low_power_ctrl vbus status get`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${response}`, command);

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith(expected);
    });
});

export {};
