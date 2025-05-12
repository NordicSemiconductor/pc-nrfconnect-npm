/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1304_GPIOS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1304 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1304_GPIOS)('Request update gpioMode index: %p', index => {
        pmic.gpioModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config mode get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1304_GPIOS)('Request update gpioPull index: %p', index => {
        pmic.gpioModule[index].get.pull();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config pull get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1304_GPIOS)('Request update gpioDrive index: %p', index => {
        pmic.gpioModule[index].get.drive();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx gpio config drive get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1304_GPIOS)(
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

    test.each(PMIC_1304_GPIOS)(
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
});

export {};
