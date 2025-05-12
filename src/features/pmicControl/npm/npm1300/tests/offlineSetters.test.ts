/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { FuelGauge, npm1300TimerMode, npm1300TimeToActive } from '../../types';
import { PMIC_1300_LEDS, setupMocksBase } from './helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const {
        mockOnFuelGaugeUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
        mockOnUsbPower,
        pmic,
    } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set set pof enable ', async () => {
        await pmic.pofModule?.set.enabled(true);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ enable: true });
    });

    test('Set set pof polarity ', async () => {
        await pmic.pofModule?.set.polarity('Active low');

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ polarity: 'Active low' });
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

    test('Set set timer config time ', async () => {
        await pmic.lowPowerModule?.set.timeToActive(
            npm1300TimeToActive['16ms']
        );

        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnLowPowerUpdate).toBeCalledWith({ timeToActive: '16' });
    });

    test('Set set timer reset longpress ', async () => {
        await pmic.resetModule?.set.longPressReset?.('disabled');

        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledWith({
            longPressReset: 'disabled',
        });
    });

    test.each(PMIC_1300_LEDS)('Set setLedMode index: %p', async index => {
        await pmic.setLedMode(index, 'Charger error');

        expect(mockOnLEDUpdate).toBeCalledTimes(1);
        expect(mockOnLEDUpdate).toBeCalledWith({
            data: { mode: 'Charger error' },
            index,
        });
    });

    test('Set setFuelGaugeEnabled', async () => {
        await pmic.fuelGaugeModule?.set.enabled(false);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith({
            enabled: false,
        } satisfies Partial<FuelGauge>);
    });

    test('Set VBusin currentLimiter', async () => {
        await pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(500);

        expect(mockOnUsbPower).toBeCalledTimes(1);
        expect(mockOnUsbPower).toBeCalledWith({ currentLimiter: 500 });
    });
});

export {};
