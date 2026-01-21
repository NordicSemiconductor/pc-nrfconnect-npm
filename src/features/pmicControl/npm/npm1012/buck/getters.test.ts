/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_BUCKS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_BUCKS)('Request update buckVOut index: %p', index => {
        pmic.buckModule[index].get.vOutNormal();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 buck vout software get 0`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_BUCKS)(
        'Request update buckAlternateVOut index: %p',
        index => {
            pmic.buckModule[index].get.alternateVOut?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 buck vout software get 1`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)('Request update buckMode index: %p', index => {
        pmic.buckModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 buck enable get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_BUCKS)(
        'Request update buckModeControl index: %p',
        index => {
            pmic.buckModule[index].get.modeControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 buck pwrmode get`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update buckOnOffControl index: %p',
        index => {
            pmic.buckModule[index].get.onOffControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 buck enable get`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update buckEnabled index: %p',
        index => {
            pmic.buckModule[index].get.enabled();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 buck enable get`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );
});

export {};
