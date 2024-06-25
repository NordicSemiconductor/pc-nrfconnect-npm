/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks as Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { BatteryModel } from '../../types';
import { npm2100FWVersion } from '../pmic2100Device';
import {
    PMIC_2100_BUCKS,
    PMIC_2100_GPIOS,
    PMIC_2100_LDOS,
    PMIC_2100_LEDS,
    setupMocksWithShellParser,
} from './helpers';

describe('PMIC 2100 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_2100_BUCKS)('Request update buckVOut index: %p', index => {
        pmic.requestUpdate.buckVOutNormal(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck voltage normal get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_2100_BUCKS)(
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

    test.each(PMIC_2100_BUCKS)('Request update buckMode index: %p', index => {
        pmic.requestUpdate.buckMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck vout_select get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_2100_BUCKS)(
        'Request update buckModeControl index: %p',
        index => {
            pmic.requestUpdate.buckModeControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_buck mode get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_2100_BUCKS)(
        'Request update buckOnOffControl index: %p',
        index => {
            pmic.requestUpdate.buckOnOffControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio on_off index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_2100_BUCKS)(
        'Request update buckRetentionControl index: %p',
        index => {
            pmic.requestUpdate.buckRetentionControl(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio retention index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_2100_BUCKS)(
        'Request update buckActiveDischargeEnabled index: %p',
        index => {
            pmic.requestUpdate.buckActiveDischarge(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck active_discharge get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_2100_BUCKS)(
        'Request update buckEnabled index: %p',
        index => {
            pmic.requestUpdate.buckEnabled(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck status get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.skip('Request LDO Updates', () => {
        test.each(PMIC_2100_LDOS)(
            'Request update ldoVoltage index: %p',
            index => {
                pmic.requestUpdate.ldoVoltage(index);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test.each(PMIC_2100_LDOS)(
            'Request update ldoEnabled index: %p',
            index => {
                pmic.requestUpdate.ldoEnabled(index);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw status get ${index}`,
                    expect.anything(),
                    undefined,
                    true
                );
            }
        );

        test.each(PMIC_2100_LDOS)('Request update ldoMode index: %p', index => {
            pmic.requestUpdate.ldoMode(index);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw mode get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        });
    });

    test.each(PMIC_2100_GPIOS)('Request update gpioMode index: %p', index => {
        pmic.gpioModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_2100_GPIOS)('Request update gpioPull index: %p', index => {
        pmic.gpioModule[index].get.pull();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config pull get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_2100_GPIOS)('Request update gpioDrive index: %p', index => {
        pmic.gpioModule[index].get.drive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config drive get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_2100_GPIOS)(
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

    test.each(PMIC_2100_GPIOS)(
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

    test.each(PMIC_2100_LEDS)('Request update ledMode index: %p', index => {
        pmic.requestUpdate.ledMode(index);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx led mode get ${index}`,
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
                    `app_version=${npm2100FWVersion}`,
                    command
                );
                return Promise.resolve();
            }
        );

        await expect(pmic.isSupportedVersion()).resolves.toStrictEqual({
            supported: true,
            version: npm2100FWVersion,
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
