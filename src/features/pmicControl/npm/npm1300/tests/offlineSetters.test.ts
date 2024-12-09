/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { npm1300TimerMode, npm1300TimeToActive, PmicDialog } from '../../types';
import { GPIOMode1300, GPIOPull1300 } from '../gpio/types';
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
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
        mockOnUsbPower,
        pmic,
    } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set setChargerVTerm ', async () => {
        await pmic.chargerModule?.set.vTerm(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 1 });
    });

    test('Set setChargerIChg', async () => {
        await pmic.chargerModule?.set.iChg(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 1 });
    });

    test('Set setChargerVTrickleFast ', async () => {
        await pmic.chargerModule?.set.vTrickleFast(2.5);
        7;
        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTrickleFast: 2.5 });
    });

    test('Set setChargerITerm', async () => {
        await pmic.chargerModule?.set.iTerm('10%');

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: '10%' });
    });

    test('Set setChargerBatLim', async () => {
        await pmic.chargerModule?.set.batLim(1000);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iBatLim: 1000 });
    });

    test('Set setChargerEnabledRecharging ', async () => {
        await pmic.chargerModule?.set.enabledRecharging(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableRecharging: true,
        });
    });

    test('Set setChargerEnabledBatLow ', async () => {
        await pmic.chargerModule?.set.enabledVBatLow(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableVBatLow: true,
        });
    });

    test('Set setChargerEnabled', async () => {
        await pmic.chargerModule?.set.enabled(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ enabled: true });
    });

    test('Set setChargerTChgResume', async () => {
        await pmic.chargerModule?.set.tChgResume(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgResume: 90 });
    });

    test('Set setChargerTChgStop', async () => {
        await pmic.chargerModule?.set.tChgStop(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgStop: 90 });
    });

    test('Set setChargerTCold', async () => {
        await pmic.chargerModule?.set.tCold(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCold: 90 });
    });

    test('Set setChargerTCool', async () => {
        await pmic.chargerModule?.set.tCool(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCool: 90 });
    });

    test('Set setChargerTWarm', async () => {
        await pmic.chargerModule?.set.tWarm(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tWarm: 90 });
    });

    test('Set setChargerTHot', async () => {
        await pmic.chargerModule?.set.tHot(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tHot: 90 });
    });

    test('Set setChargerVTermR', async () => {
        await pmic.chargerModule?.set.vTermR(3.55);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTermR: 3.55 });
    });

    test('Set setChargerNTCBeta', async () => {
        await pmic.chargerModule?.set.nTCBeta(3380);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcBeta: 3380,
        });
    });

    test('Set setChargerNTCThermistor', async () => {
        await pmic.chargerModule?.set.nTCThermistor('100 kΩ');

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcThermistor: '100 kΩ',
        });
    });
    test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
        await pmic.buckModule[index].set.vOutNormal(1.2);

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
        pmic.buckModule[index].set.vOutRetention(1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutRetention: 1.2 },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckMode index: %p', async index => {
        await pmic.buckModule[index].set.mode('software');

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckModeControl index: %p',
        async index => {
            await pmic.buckModule[index].set.modeControl('Auto');

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
            await pmic.buckModule[index].set.onOffControl('Off');

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

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckRetentionControl index: %p',
        async index => {
            await pmic.buckModule[index].set.retentionControl('Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { retentionControl: 'Off' },
                index,
            });
        }
    );

    test.each(PMIC_1300_BUCKS)('Set setBuckEnabled index: %p', async index => {
        await pmic.buckModule[index].set.enabled(false);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckActiveDischargeEnabled index: %p',
        async index => {
            await pmic.buckModule[index].set.activeDischarge(false);

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

        await pmic.ldoModule[index].set.voltage(1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.ldoModule[index].set.enabled(false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)(
        'Set setLdoSoftStartEnabled index: %p',
        async index => {
            await pmic.ldoModule[index].set.softStartEnabled?.(true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStartEnabled: true },
                index,
            });
        }
    );

    test.each(PMIC_1300_LDOS)('Set setLdoSoftStart index: %p', async index => {
        await pmic.ldoModule[index].set.softStart?.(20);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStart: 20 },
            index,
        });
    });

    test.each(PMIC_1300_LDOS)(
        'Set setLdoActiveDischarge index: %p',
        async index => {
            await pmic.ldoModule[index].set.activeDischarge?.(true);

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
            await pmic.ldoModule[index].set.onOffControl?.('SW');

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'SW',
                    onOffSoftwareControlEnabled: true,
                },
                index,
            });
        }
    );

    test.each(PMIC_1300_GPIOS)('Set setGpioMode index: %p', async index => {
        await pmic.gpioModule[index].set.mode(GPIOMode1300.Input);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: {
                mode: GPIOMode1300.Input,
                debounceEnabled: true,
                driveEnabled: false,
                pullEnabled: true,
            },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioPull index: %p', async index => {
        await pmic.gpioModule[index].set.pull(GPIOPull1300['Pull down']);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { pull: GPIOPull1300['Pull down'] },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioDrive index: %p', async index => {
        await pmic.gpioModule[index].set.drive(1);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { drive: 1 },
            index,
        });
    });

    test.each(PMIC_1300_GPIOS)('Set setGpioDebounce index: %p', async index => {
        await pmic.gpioModule[index].set.debounce(true);

        expect(mockOnGpioUpdate).toBeCalledTimes(1);
        expect(mockOnGpioUpdate).toBeCalledWith({
            data: { debounce: true },
            index,
        });
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
        await pmic.timerConfigModule?.set.mode(npm1300TimerMode.Wakeup);

        expect(mockOnTimerConfigUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledWith({
            mode: npm1300TimerMode.Wakeup,
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

    test.each(PMIC_1300_GPIOS)(
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

    test.each(PMIC_1300_LEDS)('Set setLedMode index: %p', async index => {
        await pmic.setLedMode(index, 'Charger error');

        expect(mockOnLEDUpdate).toBeCalledTimes(1);
        expect(mockOnLEDUpdate).toBeCalledWith({
            data: { mode: 'Charger error' },
            index,
        });
    });

    test('Set setFuelGaugeEnabled', async () => {
        await pmic.fuelGaugeModule.set.enabled(false);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(1);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith(false);
    });

    test('Set VBusin currentLimiter', async () => {
        await pmic.usbCurrentLimiterModule?.set.vBusInCurrentLimiter(500);

        expect(mockOnUsbPower).toBeCalledTimes(1);
        expect(mockOnUsbPower).toBeCalledWith({ currentLimiter: 500 });
    });
});

export {};
