/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1300_BUCKS, setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1300 - Setters Offline tests', () => {
    const { mockOnBuckUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
        await pmic.buckModule[index].set.vOutNormal(1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(2);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutNormal: 1.2 },
            index,
        });
        expect(mockOnBuckUpdate).nthCalledWith(2, {
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckRetentionVOut  index: %p', index => {
        pmic.buckModule[index].set.vOutRetention(1.2);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).nthCalledWith(1, {
            data: { vOutRetention: 1.2 },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)('Set setBuckMode index: %p', async index => {
        await pmic.buckModule[index].set.mode('software');

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { mode: 'software' },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckModeControl index: %p',
        async index => {
            await pmic.buckModule[index].set.modeControl('Auto');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { modeControl: 'Auto' },
                index,
            });
        },
    );

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckOnOffControl index: %p',
        async index => {
            await pmic.buckModule[index].set.onOffControl('Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'Off',
                    onOffSoftwareControlEnabled: true,
                },
                index,
            });
        },
    );

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckRetentionControl index: %p',
        async index => {
            await pmic.buckModule[index].set.retentionControl('Off');

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { retentionControl: 'Off' },
                index,
            });
        },
    );

    test.each(PMIC_1300_BUCKS)('Set setBuckEnabled index: %p', async index => {
        await pmic.buckModule[index].set.enabled(false);

        expect(mockOnBuckUpdate).toBeCalledTimes(1);
        expect(mockOnBuckUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1300_BUCKS)(
        'Set setBuckActiveDischargeEnabled index: %p',
        async index => {
            await pmic.buckModule[index].set.activeDischarge(false);

            expect(mockOnBuckUpdate).toBeCalledTimes(1);
            expect(mockOnBuckUpdate).toBeCalledWith({
                data: { activeDischarge: false },
                index,
            });
        },
    );
});

export {};
