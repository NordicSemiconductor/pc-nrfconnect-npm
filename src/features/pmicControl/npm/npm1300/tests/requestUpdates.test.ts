/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks as Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { npm1300FWVersion } from '../pmic1300Device';
import { PMIC_1300_LEDS, setupMocksWithShellParser } from './helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1300_LEDS)('Request update ledMode index: %p', index => {
        pmic.getLedMode(index);

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
        pmic.timerConfigModule?.get.prescaler!();

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
        pmic.lowPowerModule?.get.timeToActive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship config time get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request update shipLongPressReset', () => {
        pmic.resetModule?.get.longPressReset();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `powerup_ship longpress get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request enterShipMode', () => {
        pmic.lowPowerModule?.actions.enterShipMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode ship`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('Request enterShipMode', () => {
        pmic.lowPowerModule?.actions.enterShipHibernateMode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ship mode hibernate`,
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
        pmic.usbCurrentLimiterModule?.get.vBusInCurrentLimiter();

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
