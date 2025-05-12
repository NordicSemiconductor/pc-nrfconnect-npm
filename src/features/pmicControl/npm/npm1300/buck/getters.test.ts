/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_BUCKS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1300_BUCKS)('Request update buckVOut index: %p', index => {
        pmic.buckModule[index].get.vOutNormal();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck voltage normal get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)(
        'Request update buckVOutRetention index: %p',
        index => {
            pmic.buckModule[index].get.vOutRetention();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck voltage retention get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)('Request update buckMode index: %p', index => {
        pmic.buckModule[index].get.mode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npmx buck vout_select get ${index}`,
            expect.anything(),
            undefined,
            true
        );
    });

    test.each(PMIC_1300_BUCKS)(
        'Request update buckModeControl index: %p',
        index => {
            pmic.buckModule[index].get.modeControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `powerup_buck mode get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckOnOffControl index: %p',
        index => {
            pmic.buckModule[index].get.onOffControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio on_off index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckRetentionControl index: %p',
        index => {
            pmic.buckModule[index].get.retentionControl();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck gpio retention index get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckActiveDischargeEnabled index: %p',
        index => {
            pmic.buckModule[index].get.activeDischarge();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck active_discharge get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );

    test.each(PMIC_1300_BUCKS)(
        'Request update buckEnabled index: %p',
        index => {
            pmic.buckModule[index].get.enabled();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck status get ${index}`,
                expect.anything(),
                undefined,
                true
            );
        }
    );
});

export {};
