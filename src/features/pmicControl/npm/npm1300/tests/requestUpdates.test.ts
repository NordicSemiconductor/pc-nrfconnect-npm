/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks as Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { BatteryModel } from '../../types';
import { npm1300FWVersion } from '../pmic1300Device';
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
        pmic.chargerModule?.get.state();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger status all get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTerm', () => {
        pmic.chargerModule?.get.vTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage normal get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerIChg', () => {
        pmic.chargerModule?.get.iChg();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger charging_current get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerEnabled', () => {
        pmic.chargerModule?.get.enabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module charger get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTrickleFast', () => {
        pmic.chargerModule?.get.vTrickleFast();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger trickle_voltage get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerITerm', () => {
        pmic.chargerModule?.get.iTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_current get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerBatLim', () => {
        pmic.chargerModule?.get.batLim();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc fullscale get',
            expect.anything(),
            undefined,
            true
        );
    });
    test('Request update chargerEnabledRecharging', () => {
        pmic.chargerModule?.get.enabledRecharging();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module recharge get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerEnableVBatLow', () => {
        pmic.chargerModule?.get.enabledVBatLow();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'powerup_charger vbatlow get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerNTCThermistor', () => {
        pmic.chargerModule?.get.nTCThermistor();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc type get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerNTCBeta', () => {
        pmic.chargerModule?.get.nTCBeta();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc beta get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTChgResume', () => {
        pmic.chargerModule?.get.tChgResume();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp resume get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTChgStop', () => {
        pmic.chargerModule?.get.tChgStop();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp stop get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTCold', () => {
        pmic.chargerModule?.get.tCold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature cold get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTCool', () => {
        pmic.chargerModule?.get.tCool();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature cool get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTWarm', () => {
        pmic.chargerModule?.get.tWarm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature warm get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerTHot', () => {
        pmic.chargerModule?.get.tHot();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature hot get',
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update chargerVTermR', () => {
        pmic.chargerModule?.get.vTermR();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage warm get',
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)('Request update buckVOut index: %p', index => {
        pmic.buckModule[index].get.vOutNormal();

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
            pmic.buckModule[index].get.vOutRetention();

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
        pmic.buckModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck vout_select get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)(
        'Request update buckModeControl index: %p',
        index => {
            pmic.buckModule[index].get.modeControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_buck mode get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckOnOffControl index: %p',
        index => {
            pmic.buckModule[index].get.onOffControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio on_off index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckRetentionControl index: %p',
        index => {
            pmic.buckModule[index].get.retentionControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio retention index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckActiveDischargeEnabled index: %p',
        index => {
            pmic.buckModule[index].get.activeDischarge();

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
            pmic.buckModule[index].get.enabled();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck status get ${index}`,
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
            `npmx ldsw status get ${index}`,
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
            pmic.requestUpdate.ldoSoftStartEnabled?.(index);

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
            pmic.requestUpdate.ldoSoftStart?.(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start current get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoActiveDischarge index: %p',
        index => {
            pmic.requestUpdate.ldoActiveDischarge?.(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw active_discharge get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoOnOffControl index: %p',
        index => {
            pmic.requestUpdate.ldoOnOffControl?.(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw gpio index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_GPIOS)('Request update gpioMode index: %p', index => {
        pmic.gpioModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)('Request update gpioPull index: %p', index => {
        pmic.gpioModule[index].get.pull();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config pull get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)('Request update gpioDrive index: %p', index => {
        pmic.gpioModule[index].get.drive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config drive get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_GPIOS)(
        'Request update gpioDebounce index: %p',
        index => {
            pmic.gpioModule[index].get.debounce();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config debounce get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_GPIOS)(
        'Request update gpioOpenDrain index: %p',
        index => {
            pmic.gpioModule[index].get.openDrain();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx gpio config open_drain get ${index}`,
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
            `npmx led mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofEnable', () => {
        pmic.pofModule?.get.enable();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof status get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofPolarity', () => {
        pmic.pofModule?.get.polarity();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof polarity get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update pofThreshold', () => {
        pmic.pofModule?.get.threshold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx pof threshold get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigMode', () => {
        pmic.timerConfigModule?.get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config mode get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPrescaler', () => {
        pmic.timerConfigModule?.get.prescaler();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config prescaler get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update timerConfigPeriod', () => {
        pmic.timerConfigModule?.get.period();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx timer config compare get`,
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

    test('Request update shipLongPressReset', () => {
        pmic.requestUpdate.shipLongPressReset();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `powerup_ship longpress get`,
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
                slotIndex: undefined,
            },
            {
                name: 'LP502540',
                characterizations: [
                    {
                        temperature: 25,
                        capacity: 563.08,
                    },
                ],
                slotIndex: undefined,
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
                callbacks?.onSuccess(
                    `app_version=${npm1300FWVersion}`,
                    command
                );
                return Promise.resolve();
            }
        );

        await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
            supported: true,
            version: npm1300FWVersion,
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

    test('Request update vBusinCurrentLimiter', () => {
        pmic.requestUpdate.vbusinCurrentLimiter();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx vbusin current_limit get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
