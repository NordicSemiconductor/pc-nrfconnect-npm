/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../types';
import {
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
    setupMocksBase,
} from './helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const {
        mockDialogHandler,
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnTimerConfigUpdate,
        mockOnShipUpdate,
        mockOnUsbPower,
        pmic,
    } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set setChargerVTerm ', async () => {
        await pmic.setChargerVTerm(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 1 });
    });

    test('Set setChargerIChg', async () => {
        await pmic.setChargerIChg(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 1 });
    });

    test('Set setChargerVTrickleFast ', async () => {
        await pmic.setChargerVTrickleFast(2.5);
        7;
        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTrickleFast: 2.5 });
    });

    test('Set setChargerITerm', async () => {
        await pmic.setChargerITerm('10%');

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });
    });

    test('Set setChargerEnabledRecharging ', async () => {
        await pmic.setChargerEnabledRecharging(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableRecharging: true,
        });
    });

    test('Set setChargerEnabled', async () => {
        await pmic.setChargerEnabled(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ enabled: true });
    });

    test('Set setChargerTChgResume', async () => {
        await pmic.setChargerTChgResume(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgResume: 90 });
    });

    test('Set setChargerTChgStop', async () => {
        await pmic.setChargerTChgStop(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgStop: 90 });
    });

    test('Set setChargerTCold', async () => {
        await pmic.setChargerTCold(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCold: 90 });
    });

    test('Set setChargerTCool', async () => {
        await pmic.setChargerTCool(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCool: 90 });
    });

    test('Set setChargerTWarm', async () => {
        await pmic.setChargerTWarm(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tWarm: 90 });
    });

    test('Set setChargerTHot', async () => {
        await pmic.setChargerTHot(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tHot: 90 });
    });

    test('Set setChargerVTermR', async () => {
        await pmic.setChargerVTermR(3.55);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTermR: 3.55 });
    });

    test('Set setChargerNTCBeta', async () => {
        await pmic.setChargerNTCBeta(3380);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcBeta: 3380,
        });
    });

    test('Set setChargerNTCThermistor', async () => {
        await pmic.setChargerNTCThermistor('100 kΩ');

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcThermistor: '100 kΩ',
        });
    });
    test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
        await pmic.setBuckVOutNormal(index, 1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(2);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutNormal: 1.2 },
            index,
        });
        expect(mockOnBuckUpdate).nthCalledWith(2, {
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckRetentionVOut  index: %p', index => {
        pmic.setBuckVOutRetention(index, 1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutRetention: 1.2 },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckMode index: %p', async index => {
        await pmic.setBuckMode(index, 'software');

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckModeControl index: %p',
        async index => {
            await pmic.setBuckModeControl(index, 'Auto');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { modeControl: 'Auto' },
                index,
            });
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckOnOffControl index: %p',
        async index => {
            await pmic.setBuckOnOffControl(index, 'Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { onOffControl: 'Off' },
                index,
            });
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckRetentionControl index: %p',
        async index => {
            await pmic.setBuckRetentionControl(index, 'Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { retentionControl: 'Off' },
                index,
            });
        }
    );

    test.each(PMIC_1300_BUCKS)('Set setBuckEnabled index: %p', async index => {
        await pmic.setBuckEnabled(index, false);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckActiveDischargeEnabled index: %p',
        async index => {
            await pmic.setBuckActiveDischarge(index, false);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { activeDischarge: false },
                index,
            });
        }
    );

    test.each(PMIC_1300_LDOS)('Set setLdoVoltage index: %p', async index => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.setLdoVoltage(index, 1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.setLdoEnabled(index, false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)(
        'Set setLdoSoftStartEnabled index: %p',
        async index => {
            await pmic.setLdoSoftStartEnabled(index, true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStartEnabled: true },
                index,
            });
        }
    );

    test.each(PMIC_1300_LDOS)('Set setLdoSoftStart index: %p', async index => {
        await pmic.setLdoSoftStart(index, 25);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStart: 25 },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)(
        'Set setLdoActiveDischarge index: %p',
        async index => {
            await pmic.setLdoActiveDischarge(index, true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { activeDischarge: true },
                index,
            });
        }
    );

    test.each(PMIC_1300_LDOS)(
        'Set setLdoOnOffControl index: %p',
        async index => {
            await pmic.setLdoOnOffControl(index, 'SW');

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { onOffControl: 'SW' },
                index,
            });
        }
    );

    test.each(PMIC_1300_GPIOS)('Set setGpioMode index: %p', async index => {
        await pmic.setGpioMode(index, 'Input');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { mode: 'Input' },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioPull index: %p', async index => {
        await pmic.setGpioPull(index, 'Pull down');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull: 'Pull down' },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioDrive index: %p', async index => {
        await pmic.setGpioDrive(index, 1);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive: 1 },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioDebounce index: %p', async index => {
        await pmic.setGpioDebounce(index, true);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce: true },
            index,
        });
    });

    test('Set set pof enable ', async () => {
        await pmic.setPOFEnabled(true);

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ enable: true });
    });

    test('Set set pof polarity ', async () => {
        await pmic.setPOFPolarity('Active low');

        expect(mockOnPOFUpdate).toBeCalledTimes(1);
        expect(mockOnPOFUpdate).toBeCalledWith({ polarity: 'Active low' });
    });

    test('Set set timer config mode ', async () => {
        await pmic.setTimerConfigMode('Wakeup');

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({ mode: 'Wakeup' });
    });

    test('Set set timer config prescaler ', async () => {
        await pmic.setTimerConfigPrescaler('Fast');

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({ prescaler: 'Fast' });
    });

    test('Set set ship config period ', async () => {
        await pmic.setTimerConfigPeriod(1000);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({ period: 1000 });
    });

    test('Set set timer config time ', async () => {
        await pmic.setShipModeTimeToActive(16);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({ timeToActive: 16 });
    });

    test('Set set timer reset long_press ', async () => {
        await pmic.setShipLongPressReset(false);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({ longPressReset: false });
    });

    test('Set set timer reset two_buttons ', async () => {
        await pmic.setShipTwoButtonReset(false);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({ twoButtonReset: false });
    });

    test.each(PMIC_1300_GPIOS)(
        'Set setGpioOpenDrain index: %p',
        async index => {
            await pmic.setGpioOpenDrain(index, true);

            expect(mockOnGpioUpdate).toBeCalledTimes(1);
            expect(mockOnGpioUpdate).toBeCalledWith({
                data: { openDrain: true },
                index,
            });
        }
    );

    test.each(PMIC_1300_LEDS)('Set setLedMode index: %p', async index => {
        await pmic.setLedMode(index, 'Charger error');

        expect(mockOnLEDUpdate).toBeCalledTimes(1);
        expect(mockOnLEDUpdate).toBeCalledWith({
            data: { mode: 'Charger error' },
            index,
        });
    });

    test('Set setFuelGaugeEnabled', async () => {
        await pmic.setFuelGaugeEnabled(false);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
    });

    test('Set VBusin currentLimiter', async () => {
        await pmic.setVBusinCurrentLimiter(500);

        expect(mockOnUsbPower).toBeCalledTimes(1);
        expect(mockOnUsbPower).toBeCalledWith({ currentLimiter: 500 });
    });
});

export {};
