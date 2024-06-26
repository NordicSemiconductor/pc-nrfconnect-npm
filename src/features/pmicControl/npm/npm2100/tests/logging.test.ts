/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared/typings/generated/src/Parsers/shellParser';

import { USBDetectStatusValues } from '../../types';
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
        let {
            eventHandlers,
            mockOnAdcSample,
            mockOnBeforeReboot,
            mockOnUsbPower,
            mockOnErrorLogs,
            mockEnqueueRequest,
            pmic,
        } = setupMocksWithShellParser();

        beforeEach(() => {
            const setupMock = setupMocksWithShellParser();

            eventHandlers = setupMock.eventHandlers;
            mockOnAdcSample = setupMock.mockOnAdcSample;
            mockOnBeforeReboot = setupMock.mockOnBeforeReboot;
            mockOnUsbPower = setupMock.mockOnUsbPower;
            mockOnErrorLogs = setupMock.mockOnErrorLogs;
            mockEnqueueRequest = setupMock.mockEnqueueRequest;
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

        test.each(
            [
                'No USB connection',
                'Default USB 100/500mA',
                '1.5A High Power',
                '3A High Power',
            ].map((value, index) => ({ value, index }))
        )('USB Power events', ({ value, index }) => {
            eventHandlers.mockOnShellLoggingEventHandler(
                `[00:00:17.525,000] <inf> module_pmic: ${value}`
            );

            expect(mockOnUsbPower).toBeCalledTimes(1);
            expect(mockOnUsbPower).toBeCalledWith({
                detectStatus: USBDetectStatusValues[index],
            });
        });

        test('Reset Cause Reason', () => {
            eventHandlers.mockOnShellLoggingEventHandler(
                `[00:00:00.038,238] <inf> module_pmic_irq: type=RSTCAUSE,bit=SWRESET`
            );

            expect(mockOnErrorLogs).toBeCalledTimes(1);

            expect(mockOnErrorLogs).toBeCalledWith({
                resetCause: ['SWRESET'],
            });
        });

        test('Charger Error', () => {
            jest.clearAllMocks();
            mockEnqueueRequest.mockClear();
            mockEnqueueRequest.mockImplementationOnce(
                (
                    command: string,
                    callbacks?: Callbacks,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    _timeout?: number,
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    _unique?: boolean
                ) => {
                    expect(command).toBe('npmx errlog get');
                    callbacks?.onSuccess(
                        `RSTCAUSE:
                        Shipmode exit
                        CHARGER_ERROR:
                        NTC sensor error
                        VBAT Sensor Error
                        SENSOR_ERROR:
                        NTC sensor error 2
                        VBAT Sensor Error 2`,
                        command
                    );
                    return Promise.resolve();
                }
            );

            eventHandlers.mockOnShellLoggingEventHandler(
                `[00:00:06.189,514] <inf> module_pmic_irq: type=EVENTSBCHARGER1SET,bit=EVENTCHGERROR`
            );

            expect(mockOnErrorLogs).toBeCalledTimes(4);
            expect(mockOnErrorLogs).nthCalledWith(1, {
                chargerError: [],
                sensorError: [],
            });
            expect(mockOnErrorLogs).nthCalledWith(2, {
                resetCause: ['Shipmode exit'],
            });
            expect(mockOnErrorLogs).nthCalledWith(3, {
                chargerError: ['NTC sensor error', 'VBAT Sensor Error'],
            });
            expect(mockOnErrorLogs).nthCalledWith(4, {
                sensorError: ['NTC sensor error 2', 'VBAT Sensor Error 2'],
            });
        });
    });
});

export {};
