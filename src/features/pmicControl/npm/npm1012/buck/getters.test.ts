/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BuckModeControl } from '../../types';
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
            `npm1012 buck voutselctrl get`,
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
                `npm1012 buck enablectrl get`,
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

    test.each(PMIC_1012_BUCKS)(
        'Request update activeDischargeResistance index: %p',
        index => {
            pmic.buckModule[index].get.activeDischargeResistance?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck pulldown get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update alternateVOut index: %p',
        index => {
            pmic.buckModule[index].get.alternateVOut?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck vout software get 1',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update alternateVOutControl index: %p',
        index => {
            pmic.buckModule[index].get.alternateVOutControl?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck voutselctrl get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update automaticPassthrough index: %p',
        index => {
            pmic.buckModule[index].get.automaticPassthrough?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck passthrough get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update quickVOutDischarge index: %p',
        index => {
            pmic.buckModule[index].get.quickVOutDischarge?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck autopull get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update peakCurrentLimit index: %p',
        index => {
            pmic.buckModule[index].get.peakCurrentLimit?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck peakilim get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update shortCircuitProtection index: %p',
        index => {
            pmic.buckModule[index].get.shortCircuitProtection?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck scprotect get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Request update softStartPeakCurrentLimit index: %p',
        index => {
            pmic.buckModule[index].get.softStartPeakCurrentLimit?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck softstartilim get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );

    test.each(
        PMIC_1012_BUCKS.map(index => [
            {
                index,
                mode: 'LP',
            },
            {
                index,
                mode: 'ULP',
            },
        ]).flat(),
    )('Request update vOutComparatorBiasCurrent %p', ({ index, mode }) => {
        pmic.buckModule[index].get.vOutComparatorBiasCurrent?.(
            mode as BuckModeControl,
        );

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm1012 buck bias ${mode.toLowerCase()} get`,
            expect.anything(),
            undefined,
            true,
        );
    });

    test.each(PMIC_1012_BUCKS)(
        'Request update vOutRippleControl index: %p',
        index => {
            pmic.buckModule[index].get.vOutRippleControl?.();

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                'npm1012 buck ripple get',
                expect.anything(),
                undefined,
                true,
            );
        },
    );
});

export {};
