/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_2100_LDOS, setupMocksWithShellParser } from '../tests/helpers';

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
                    true
                );
            }
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
                    true
                );
            }
        );

        test.each(PMIC_2100_LDOS)('Request update ldoMode index: %p', index => {
            pmic.ldoModule[index].get.mode();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw mode get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        });
    });
});

export {};
