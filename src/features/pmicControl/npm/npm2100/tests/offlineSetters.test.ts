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
        await pmic.gpioModule[index].set.mode('Input');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { mode: 'Input' },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioPull index: %p', async index => {
        await pmic.gpioModule[index].set.pull('Pull down');

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull: 'Pull down' },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDrive index: %p', async index => {
        await pmic.gpioModule[index].set.drive(1);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive: 1 },
            index,
        });
    });

    test.each(PMIC_2100_GPIOS)('Set setGpioDebounce index: %p', async index => {
        await pmic.gpioModule[index].set.debounce(true);

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
            await pmic.gpioModule[index].set.openDrain(true);

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
