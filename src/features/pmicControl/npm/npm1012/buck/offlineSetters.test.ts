/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_BUCKS, setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnBuckUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_BUCKS)('Set setBuckVOut index: %p', async index => {
        await pmic.buckModule[index].set.vOutNormal(1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { vOutNormal: 1.2 },
            index,
        });
    });

    test.each(PMIC_1012_BUCKS)('Set setBuckAlternateVOut  index: %p', index => {
        pmic.buckModule[index].set.alternateVOut?.(1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { alternateVOut: 1.2 },
            index,
        });
    });

    test.each(PMIC_1012_BUCKS)('Set setBuckMode index: %p', async index => {
        await pmic.buckModule[index].set.mode('software');

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckModeControl index: %p',
        async index => {
            await pmic.buckModule[index].set.modeControl('ULP');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { modeControl: 'ULP' },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckOnOffControl index: %p',
        async index => {
            await pmic.buckModule[index].set.onOffControl('GPIO');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'GPIO',
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)('Set setBuckEnabled index: %p', async index => {
        await pmic.buckModule[index].set.enabled(false);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckActiveDischargeResistance index: %p',
        async index => {
            await pmic.buckModule[index].set.activeDischargeResistance?.(250);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    activeDischargeResistance: 250,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckAlternateVOut index: %p',
        async index => {
            await pmic.buckModule[index].set.alternateVOut?.(1.55);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    alternateVOut: 1.55,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckAlternateVOutControl index: %p',
        async index => {
            await pmic.buckModule[index].set.alternateVOutControl?.('GPIO');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    alternateVOutControl: 'GPIO',
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckAutomaticPassthrough index: %p',
        async index => {
            await pmic.buckModule[index].set.automaticPassthrough?.(true);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    automaticPassthrough: true,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckQuickVOutDischarge index: %p',
        async index => {
            await pmic.buckModule[index].set.quickVOutDischarge?.(true);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    quickVOutDischarge: true,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckPeakCurrentLimit index: %p',
        async index => {
            await pmic.buckModule[index].set.peakCurrentLimit?.(142);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    peakCurrentLimit: 142,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckShortCircuitProtection index: %p',
        async index => {
            await pmic.buckModule[index].set.shortCircuitProtection?.(true);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    shortCircuitProtection: true,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckSoftStartPeakCurrentLimit index: %p',
        async index => {
            await pmic.buckModule[index].set.softStartPeakCurrentLimit?.(142);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    softStartPeakCurrentLimit: 142,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckVOutComparatorBiasCurrent LP mode index: %p',
        async index => {
            await pmic.buckModule[index].set.vOutComparatorBiasCurrent?.(
                'LP',
                1.4,
            );

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    vOutComparatorBiasCurrentLPMode: 1.4,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckVOutComparatorBiasCurrent ULP mode index: %p',
        async index => {
            await pmic.buckModule[index].set.vOutComparatorBiasCurrent?.(
                'ULP',
                28,
            );

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    vOutComparatorBiasCurrentULPMode: 28,
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_BUCKS)(
        'Set setBuckVOutRippleControl index: %p',
        async index => {
            await pmic.buckModule[index].set.vOutRippleControl?.('High');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    vOutRippleControl: 'High',
                },
                index,
            });
        },
    );
});

export {};
