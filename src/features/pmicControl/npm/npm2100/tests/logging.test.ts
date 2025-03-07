/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from './helpers';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'clearTimeout');
const systemTime = new Date('2020-01-01');
jest.setSystemTime(systemTime);

describe('PMIC 2100 - Logging', () => {
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
        let { eventHandlers, mockOnAdcSample, mockOnBeforeReboot, pmic } =
            setupMocksWithShellParser();

        beforeEach(() => {
            const setupMock = setupMocksWithShellParser();

            eventHandlers = setupMock.eventHandlers;
            mockOnAdcSample = setupMock.mockOnAdcSample;
            mockOnBeforeReboot = setupMock.mockOnBeforeReboot;
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
                '[00:00:17.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001,tte=312,ttf=514'
            );

            expect(mockOnAdcSample).toBeCalledTimes(1);
            expect(mockOnAdcSample).toBeCalledWith({
                timestamp: 17525,
                vBat: 4.25,
                tDie: 26.7,
                soc: 98.7,
            });
        });

        test('Adc Sample Logging event - overflow 1193.046471111111 hrs +', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:16.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:10.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                '[00:00:8.525,000] <inf> module_pmic_adc: ibat=0.000617,vbat=4.248000,tdie=26.656051,soc=98.705001'
            );

            expect(mockOnAdcSample).toBeCalledTimes(3);
            expect(mockOnAdcSample).nthCalledWith(1, {
                timestamp: 16525,
                vBat: 4.25,
                tDie: 26.7,
                soc: 98.7,
            });

            expect(mockOnAdcSample).nthCalledWith(2, {
                timestamp: 2 ** 32 - 1 + 10525, // 1193hrs 02min 47sec 295ms + 10.525 sec
                vBat: 4.25,
                tDie: 26.7,
                soc: 98.7,
            });

            expect(mockOnAdcSample).nthCalledWith(3, {
                timestamp: (2 ** 32 - 1) * 2 + 8525, // 1193hrs 02min 47sec 295ms + 8.525 sec
                vBat: 4.25,
                tDie: 26.7,
                soc: 98.7,
            });
        });
    });
});

export {};
