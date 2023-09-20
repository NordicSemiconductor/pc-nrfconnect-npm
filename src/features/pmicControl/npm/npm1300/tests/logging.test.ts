/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicChargingState } from '../../types';
import { setupMocksWithShellParser } from './helpers';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');
const systemTime = new Date('2020-01-01');
jest.setSystemTime(systemTime);

describe('PMIC 1300 - Logging', () => {
    describe('Any command callback', () => {
        const { eventHandlers, mockOnLoggingEvent } =
            setupMocksWithShellParser();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        const verifyLogging = (
            logLevel: 'err' | 'inf',
            command: string,
            response: string
        ) => {
            expect(mockOnLoggingEvent).toBeCalledTimes(1);
            expect(mockOnLoggingEvent).toBeCalledWith({
                loggingEvent: {
                    timestamp: 0,
                    module: 'shell_commands',
                    logLevel,
                    message: `command: "${command}" response: "${response}"`,
                },
                dataPair: false,
            });
        };

        test('Any Command callback error type', () => {
            eventHandlers.mockAnyCommandResponseHandlers.forEach(handler =>
                handler({
                    command: 'command',
                    response: 'response',
                    error: true,
                })
            );

            verifyLogging('err', 'command', 'response');
        });

        test('Any Command callback error type', () => {
            eventHandlers.mockAnyCommandResponseHandlers.forEach(handler =>
                handler({
                    command: 'command',
                    response: 'response',
                    error: false,
                })
            );

            verifyLogging('inf', 'command', 'response');
        });
    });

    describe('Specific logging events', () => {
        let {
            eventHandlers,
            mockOnAdcSample,
            mockOnBeforeReboot,
            mockOnUsbPowered,
            mockOnChargingStatusUpdate,
            pmic,
        } = setupMocksWithShellParser();

        beforeEach(() => {
            const setupMock = setupMocksWithShellParser();

            eventHandlers = setupMock.eventHandlers;
            mockOnAdcSample = setupMock.mockOnAdcSample;
            mockOnBeforeReboot = setupMock.mockOnBeforeReboot;
            mockOnUsbPowered = setupMock.mockOnUsbPowered;
            mockOnChargingStatusUpdate = setupMock.mockOnChargingStatusUpdate;
            pmic = setupMock.pmic;
        });

        test('Reboot when device PMIC is available', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: PMIC available. Application can be restarted.'
            );

            expect(mockOnBeforeReboot).toBeCalledTimes(1);
        });

        test('Does not Reboot if auto reboot is off PMIC is available', async () => {
            pmic.setAutoRebootDevice(false);
            await eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:02.019,531] <wrn> module_pmic: PMIC available. Application can be restarted.'
            );

            expect(mockOnBeforeReboot).toBeCalledTimes(0);

            pmic.setAutoRebootDevice(true);

            expect(mockOnBeforeReboot).toBeCalledTimes(1);
        });

        test('Adc Sample Logging event once', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(1);
            expect(mockOnAdcSample).toBeCalledWith({
                timestamp: 17525,
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });
        });

        test('Adc Sample Logging event - overflow 1193.046471111111 hrs +', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:10.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:8.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tbat=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(3);
            expect(mockOnAdcSample).nthCalledWith(1, {
                timestamp: 16525,
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(2, {
                timestamp: 2 ** 32 - 1 + 10525, // 1193hrs 02min 47sec 295ms + 10.525 sec
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });

            expect(mockOnAdcSample).nthCalledWith(3, {
                timestamp: (2 ** 32 - 1) * 2 + 8525, // 1193hrs 02min 47sec 295ms + 8.525 sec
                vBat: 4.25,
                iBat: 0.62, // converted to mA
                tBat: 26.7,
                soc: 98.7,
                tte: 312,
                ttf: 514,
            });
        });

        test('USB Power detected  event', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_irq: type=EVENTSVBUSIN0SET,bit=EVENTVBUSDETECTED'
            );

            expect(mockOnUsbPowered).toBeCalledTimes(1);
            expect(mockOnUsbPowered).toBeCalledWith(true);
        });

        test('USB Power removed event', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:17.525,000] <inf> module_pmic_irq: type=EVENTSVBUSIN0SET,bit=EVENTVBUSREMOVED'
            );

            expect(mockOnUsbPowered).toBeCalledTimes(1);
            expect(mockOnUsbPowered).toBeCalledWith(false);
        });

        test.each([0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80])(
            'Charging status event %p',
            value => {
                eventHandlers.mockOnShellLoggingEventHandler(
                    `[00:28:48.730,346] <inf> module_pmic_charger: charger status=${value}`
                );

                expect(mockOnChargingStatusUpdate).toBeCalledTimes(1);
                expect(mockOnChargingStatusUpdate).toBeCalledWith({
                    // eslint-disable-next-line no-bitwise
                    batteryDetected: (value & 0x01) > 0,
                    // eslint-disable-next-line no-bitwise
                    batteryFull: (value & 0x02) > 0,
                    // eslint-disable-next-line no-bitwise
                    trickleCharge: (value & 0x04) > 0,
                    // eslint-disable-next-line no-bitwise
                    constantCurrentCharging: (value & 0x08) > 0,
                    // eslint-disable-next-line no-bitwise
                    constantVoltageCharging: (value & 0x10) > 0,
                    // eslint-disable-next-line no-bitwise
                    batteryRechargeNeeded: (value & 0x20) > 0,
                    // eslint-disable-next-line no-bitwise
                    dieTempHigh: (value & 0x40) > 0,
                    // eslint-disable-next-line no-bitwise
                    supplementModeActive: (value & 0x80) > 0,
                } as PmicChargingState);
            }
        );
    });
});

export {};