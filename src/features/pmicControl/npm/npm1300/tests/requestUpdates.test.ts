/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks as Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { BatteryModel } from '../../types';
import {
    PMIC_1300_BUCKS,
    PMIC_1300_GPIOS,
    PMIC_1300_LDOS,
    PMIC_1300_LEDS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update pmicChargingState', () => {
        pmic.requestUpdate.pmicChargingState();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger status get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTerm', () => {
        pmic.requestUpdate.chargerVTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage normal get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerIChg', () => {
        pmic.requestUpdate.chargerIChg();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger charger_current get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerEnabled', () => {
        pmic.requestUpdate.chargerEnabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module charger get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTrickleFast', () => {
        pmic.requestUpdate.chargerVTrickleFast();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger trickle get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerITerm', () => {
        pmic.requestUpdate.chargerITerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_current get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerBatLim', () => {
        pmic.requestUpdate.chargerBatLim();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger discharging_current get',
            expect.anything(),
            undefined,
            true
        );
    });
    test('Request update chargerEnabledRecharging', () => {
        pmic.requestUpdate.chargerEnabledRecharging();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module recharge get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerNTCThermistor', () => {
        pmic.requestUpdate.chargerNTCThermistor();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTChgResume', () => {
        pmic.requestUpdate.chargerTChgResume();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp resume get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTChgStop', () => {
        pmic.requestUpdate.chargerTChgStop();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp stop get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.skip('Request update chargerTCold', () => {
        pmic.requestUpdate.chargerTCold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.skip('Request update chargerTCool', () => {
        pmic.requestUpdate.chargerTCool();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.skip('Request update chargerTWarm', () => {
        pmic.requestUpdate.chargerTWarm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.skip('Request update chargerTHot', () => {
        pmic.requestUpdate.chargerTHot();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.skip('Request update chargerCurrentCool', () => {
        pmic.requestUpdate.chargerCurrentCool();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTermR', () => {
        pmic.requestUpdate.chargerVTermR();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage warm get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)('Request update buckVOut index: %p', index => {
        pmic.requestUpdate.buckVOutNormal(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck voltage normal get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)(
        'Request update buckVOutRetention index: %p',
        index => {
            pmic.requestUpdate.buckVOutRetention(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck voltage retention get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)('Request update buckMode index: %p', index => {
        pmic.requestUpdate.buckMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck vout select get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)(
        'Request update buckModeControl index: %p',
        index => {
            pmic.requestUpdate.buckModeControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio pwm_force get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckOnOffControl index: %p',
        index => {
            pmic.requestUpdate.buckOnOffControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio on_off get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckRetentionControl index: %p',
        index => {
            pmic.requestUpdate.buckRetentionControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio retention get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckActiveDischargeEnabled index: %p',
        index => {
            pmic.requestUpdate.buckActiveDischargeEnabled(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck active_discharge get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckEnabled index: %p',
        index => {
            pmic.requestUpdate.buckEnabled(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck status power get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_LDOS)('Request update ldoVoltage index: %p', index => {
        pmic.requestUpdate.ldoVoltage(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw ldo_voltage get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_LDOS)('Request update ldoEnabled index: %p', index => {
        pmic.requestUpdate.ldoEnabled(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_LDOS)('Request update ldoMode index: %p', index => {
        pmic.requestUpdate.ldoMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_LDOS)(
        'Request update ldoSoftStartEnabled index: %p',
        index => {
            pmic.requestUpdate.ldoSoftStartEnabled(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start enable get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoSoftStart index: %p',
        index => {
            pmic.requestUpdate.ldoSoftStart(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start current get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_GPIOS)('Request update gpioMode index: %p', index => {
        pmic.requestUpdate.gpioMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)('Request update gpioPull index: %p', index => {
        pmic.requestUpdate.gpioPull(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio pull get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)('Request update gpioDrive index: %p', index => {
        pmic.requestUpdate.gpioDrive(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio drive get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)(
        'Request update gpioDebounce index: %p',
        index => {
            pmic.requestUpdate.gpioDebounce(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio debounce get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_GPIOS)(
        'Request update gpioOpenDrain index: %p',
        index => {
            pmic.requestUpdate.gpioOpenDrain(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio open_drain get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_LEDS)('Request update ledMode index: %p', index => {
        pmic.requestUpdate.ledMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx leds mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofEnable', () => {
        pmic.requestUpdate.pofEnable();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof enable get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofPolarity', () => {
        pmic.requestUpdate.pofPolarity();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof polarity get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofThreshold', () => {
        pmic.requestUpdate.pofThreshold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof threshold get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigMode', () => {
        pmic.requestUpdate.timerConfigMode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config mode get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPrescaler', () => {
        pmic.requestUpdate.timerConfigPrescaler();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config prescaler get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPeriod', () => {
        pmic.requestUpdate.timerConfigPeriod();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config period get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update shipModeTimeToActive', () => {
        pmic.requestUpdate.shipModeTimeToActive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship config time get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update shipInvertPolarity', () => {
        pmic.requestUpdate.shipInvertPolarity();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship config inv_polarity get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update shipLongPressReset', () => {
        pmic.requestUpdate.shipLongPressReset();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship reset long_press get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update shipTwoButtonReset', () => {
        pmic.requestUpdate.shipTwoButtonReset();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship reset two_buttons get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request enterShipMode', () => {
        pmic.enterShipMode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode ship`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request enterShipMode', () => {
        pmic.enterShipHibernateMode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode hibernate`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update fuelGauge', () => {
        pmic.requestUpdate.fuelGauge();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `fuel_gauge get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update activeBatteryModel', () => {
        pmic.requestUpdate.activeBatteryModel();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `fuel_gauge model get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update storedBatteryModel', () => {
        pmic.requestUpdate.storedBatteryModel();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `fuel_gauge model list`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request getHardcodedBatteryModels success', async () => {
        mockEnqueueRequest.mockImplementationOnce(
            (
                _command: string,
                callbacks?: Callbacks,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _timeout?: number,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _unique?: boolean
            ) => {
                callbacks?.onSuccess(
                    `Currently active battery model:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                    Hardcoded battery models:
                            name="LP803448",T={5.00 C,25.00 C,45.00 C},Q={1413.40 mAh,1518.28 mAh,1500.11 mAh}
                            name="LP502540",T={25.00 C},Q={563.08 mAh}
                    Battery models stored in database:
                            Slot 0: Empty
                            Slot 1: Empty
                            Slot 2: Empty`,
                    'fuel_gauge model list'
                );
                return Promise.resolve();
            }
        );

        await expect(pmic.getHardcodedBatteryModels()).resolves.toStrictEqual([
            {
                name: 'LP803448',
                characterizations: [
                    {
                        temperature: 45,
                        capacity: 1500.11,
                    },
                    {
                        temperature: 25,
                        capacity: 1518.28,
                    },
                    {
                        temperature: 5,
                        capacity: 1413.4,
                    },
                ],
            },
            {
                name: 'LP502540',
                characterizations: [
                    {
                        temperature: 25,
                        capacity: 563.08,
                    },
                ],
            },
        ] as BatteryModel[]);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `fuel_gauge model list`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request startAdcSample', () => {
        pmic.startAdcSample(2000, 1000);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc sample 1000 2000',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request stopAdcSample', () => {
        pmic.stopAdcSample();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc sample 0',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request getKernelUptime', async () => {
        mockEnqueueRequest.mockImplementationOnce(
            (
                command: string,
                callbacks?: Callbacks,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _timeout?: number,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _unique?: boolean
            ) => {
                callbacks?.onSuccess('Uptime: 2945165 ms', command);
                return Promise.resolve();
            }
        );

        await expect(pmic.getKernelUptime()).resolves.toBe(2945165);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'kernel uptime',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request isSupportedVersion - latests', async () => {
        mockEnqueueRequest.mockImplementationOnce(
            (
                command: string,
                callbacks?: Callbacks,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _timeout?: number,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _unique?: boolean
            ) => {
                callbacks?.onSuccess('app_version=0.9.2+8', command);
                return Promise.resolve();
            }
        );

        await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
            supported: true,
            version: '0.9.2+8',
        });

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'app_version',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request isSupportedVersion - old version', async () => {
        mockEnqueueRequest.mockImplementationOnce(
            (
                command: string,
                callbacks?: Callbacks,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _timeout?: number,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                _unique?: boolean
            ) => {
                callbacks?.onSuccess('app_version=0.0.0+9', command);
                return Promise.resolve();
            }
        );

        await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
            supported: false,
            version: '0.0.0+9',
        });

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'app_version',
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
