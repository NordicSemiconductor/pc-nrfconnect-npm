/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_LDOS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_LDOS)('Request update ldoVoltage index: %p', index => {
        pmic.ldoModule[index].get.voltage?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 ldosw vout software get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_LDOS)('Request update ldoEnabled index: %p', index => {
        pmic.ldoModule[index].get.enabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 ldosw enable get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_LDOS)('Request update ldoMode index: %p', index => {
        pmic.ldoModule[index].get.mode?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 ldosw mode get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_LDOS)(
        'Request update ldoSoftStart index: %p',
        index => {
            pmic.ldoModule[index].get.softStart?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstart get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Request update ldoSoftStartCurrentLimit index: %p',
        index => {
            pmic.ldoModule[index].get.softStartCurrent?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstartilim get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Request update ldoSoftStartTime index: %p',
        index => {
            pmic.ldoModule[index].get.softStartTime?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw softstarttime get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Request update ldoActiveDischarge index: %p',
        index => {
            pmic.ldoModule[index].get.activeDischarge?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw activedischarge get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Request update ldoOvercurrentProtection index: %p',
        index => {
            pmic.ldoModule[index].get.overcurrentProtection?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw ocp get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Request update ldoOnOffControl index: %p',
        index => {
            pmic.ldoModule[index].get.onOffControl?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw enablectrl get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_LDOS)('Request update ldoVOutSel index: %p', index => {
        pmic.ldoModule[index].get.vOutSel?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 ldosw voutsel get ${index}`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_LDOS)(
        'Request update ldoWeakPullDown index: %p',
        index => {
            pmic.ldoModule[index].get.weakPullDown?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm1012 ldosw weakpull get ${index}`,
                expect.anything(),
                undefined,
                true,
            );
        },
    );
});

export {};
