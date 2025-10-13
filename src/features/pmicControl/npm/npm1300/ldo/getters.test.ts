/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_LDOS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1300_LDOS)('Request update ldoVoltage index: %p', index => {
        pmic.ldoModule[index].get.voltage();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw ldo_voltage get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1300_LDOS)('Request update ldoEnabled index: %p', index => {
        pmic.ldoModule[index].get.enabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw status get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1300_LDOS)('Request update ldoMode index: %p', index => {
        pmic.ldoModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx ldsw mode get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1300_LDOS)(
        'Request update ldoSoftStartEnabled index: %p',
        index => {
            pmic.ldoModule[index].get.softStartEnabled?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start enable get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoSoftStart index: %p',
        index => {
            pmic.ldoModule[index].get.softStart?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw soft_start current get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoActiveDischarge index: %p',
        index => {
            pmic.ldoModule[index].get.activeDischarge?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw active_discharge get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1300_LDOS)(
        'Request update ldoOnOffControl index: %p',
        index => {
            pmic.ldoModule[index].get.onOffControl?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx ldsw gpio index get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );
});

export {};
