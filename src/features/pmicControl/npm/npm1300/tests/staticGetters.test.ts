/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_BUCKS, PMIC_1300_LDOS, setupMocksBase } from './helpers';

describe('PMIC 1300 - Static getters', () => {
    const { pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Number of Bucks', () => expect(pmic.buckModule.length).toBe(2));

    test('Number of LDOs', () => expect(pmic.ldoModule.length).toBe(2));

    test('Number of GPIOs', () => expect(pmic.gpioModule.length).toBe(5));

    test('Number of LEDs', () => expect(pmic.getNumberOfLEDs()).toBe(3));

    test('Device Type', () => expect(pmic.deviceType).toBe('npm1300'));

    test.each(PMIC_1300_BUCKS)('Buck Voltage Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.voltage).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
        })
    );

    test.each(PMIC_1300_BUCKS)('Buck RetVOut Range index: %p', index =>
        expect(pmic.buckModule[index].ranges.retVOut).toStrictEqual({
            min: 1,
            max: 3,
            decimals: 1,
        })
    );

    test.each(PMIC_1300_LDOS)('LDO Voltage Range index: %p', index =>
        expect(pmic.ldoModule[index].ranges.voltage).toStrictEqual({
            min: 1,
            max: 3.3,
            decimals: 1,
            step: 0.1,
        })
    );

    test('USB Power Current Limiter Range', () =>
        expect(
            pmic.usbCurrentLimiterModule?.ranges.vBusInLimiter
        ).toStrictEqual([
            0.1, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5,
        ]));
});

export {};
