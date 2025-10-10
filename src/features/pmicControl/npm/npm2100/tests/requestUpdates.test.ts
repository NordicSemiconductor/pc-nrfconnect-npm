/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks as Callbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { npm2100FWVersion } from '../pmic2100Device';
import { PMIC_2100_LDOS, setupMocksWithShellParser } from './helpers';

describe('PMIC 2100 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.skip('Request LDO Updates', () => {
        test.each(PMIC_2100_LDOS)(
            'Request update ldoVoltage index: %p',
            index => {
                pmic.ldoModule[index].get.voltage();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw ldo_voltage get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each(PMIC_2100_LDOS)(
            'Request update ldoEnabled index: %p',
            index => {
                pmic.ldoModule[index].get.enabled();

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx ldsw status get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );
            },
        );

        test.each(PMIC_2100_LDOS)('Request update ldoMode index: %p', index => {
            pmic.ldoModule[index].get.mode();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw mode get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        });
    });

    test('Request startAdcSample', () => {
        pmic.startAdcSample(2000, 1000);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc sample 1000 2000',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request stopAdcSample', () => {
        pmic.stopAdcSample();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc sample 0',
            expect.anything(),
            undefined,
            true,
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
                _unique?: boolean,
            ) => {
                callbacks?.onSuccess('Uptime: 2945165 ms', command);
                return Promise.resolve();
            },
        );

        await expect(pmic.getKernelUptime()).resolves.toBe(2945165);

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'kernel uptime',
            expect.anything(),
            undefined,
            true,
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
                _unique?: boolean,
            ) => {
                callbacks?.onSuccess(
                    `app_version=${npm2100FWVersion}`,
                    command,
                );
                return Promise.resolve();
            },
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
            true,
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
                _unique?: boolean,
            ) => {
                callbacks?.onSuccess('app_version=0.0.0+9', command);
                return Promise.resolve();
            },
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
            true,
        );
    });
});

export {};
