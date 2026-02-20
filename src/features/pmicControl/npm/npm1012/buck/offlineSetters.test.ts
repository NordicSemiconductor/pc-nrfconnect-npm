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
});

export {};
