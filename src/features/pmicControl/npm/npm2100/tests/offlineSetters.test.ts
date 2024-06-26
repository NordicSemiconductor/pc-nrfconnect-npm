/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../types';
import {
    PMIC_2100_BUCKS,
    PMIC_2100_GPIOS,
    PMIC_2100_LDOS,
    PMIC_2100_LEDS,
    setupMocksBase,
} from './helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 2100 - Setters Offline tests', () => {
    const {
        mockDialogHandler,
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnFuelGaugeUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
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

    test('Set setChargerBatLim', async () => {
        await pmic.setChargerBatLim(1000);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iBatLim: 1000 });
    });

    test('Set setChargerEnabledRecharging ', async () => {
        await pmic.setChargerEnabledRecharging(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableRecharging: true,
        });
    });

    test('Set setChargerEnabledBatLow ', async () => {
        await pmic.setChargerEnabledVBatLow(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableVBatLow: true,
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
    test.each(PMIC_2100_BUCKS)('Set setBuckVOut index: %p', async index => {
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

    test.each(PMIC_2100_BUCKS)('Set setBuckRetentionVOut  index: %p', index => {
        pmic.setBuckVOutRetention(index, 1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutRetention: 1.2 },
            index,
        });
    });

    test.each(PMIC_2100_BUCKS)('Set setBuckMode index: %p', async index => {
        await pmic.setBuckMode(index, 'software');

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_2100_BUCKS)(
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

    test.each(PMIC_2100_BUCKS)(
        'Set setBuckOnOffControl index: %p',
        async index => {
            await pmic.setBuckOnOffControl(index, 'Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'Off',
                    onOffSoftwareControlEnabled: true,
                },
                index,
            });
        }
    );

    test.each(PMIC_2100_BUCKS)(
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

    test.each(PMIC_2100_BUCKS)('Set setBuckEnabled index: %p', async index => {
        await pmic.setBuckEnabled(index, false);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_2100_BUCKS)(
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

    test.each(PMIC_2100_LDOS)('Set setLdoVoltage index: %p', async index => {
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

    test.each(PMIC_2100_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.setLdoEnabled(index, false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioMode index: %p', async index => {
        await pmic.setGpioMode(index, 'Input');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { mode: 'Input' },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioPull index: %p', async index => {
        await pmic.setGpioPull(index, 'Pull down');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull: 'Pull down' },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDrive index: %p', async index => {
        await pmic.setGpioDrive(index, 1);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive: 1 },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDebounce index: %p', async index => {
        await pmic.setGpioDebounce(index, true);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce: true },
            index,
        });
    });

    test('Set set timer config time ', async () => {
        await pmic.setShipModeTimeToActive(16);

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({ timeToActive: 16 });
    });

    test('Set set timer reset longpress ', async () => {
        await pmic.setShipLongPressReset('disabled');

        expect(mockOnShipUpdate).toBeCalledTimes(1);
        expect(mockOnShipUpdate).toBeCalledWith({ longPressReset: 'disabled' });
    });

    test.each(PMIC_2100_GPIOS)(
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

    test.each(PMIC_2100_LEDS)('Set setLedMode index: %p', async index => {
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
