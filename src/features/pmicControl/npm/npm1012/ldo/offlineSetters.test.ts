/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PMIC_1012_LDOS, setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnLdoUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1012_LDOS)('Set setLdoVoltage index: %p', async index => {
        await pmic.ldoModule[index].set.voltage?.(1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_1012_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.ldoModule[index].set.enabled(false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1012_LDOS)('Set setLdoSoftStart index: %p', async index => {
        await pmic.ldoModule[index].set.softStart?.(true);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStart: true },
            index,
        });
    });

    test.each(PMIC_1012_LDOS)(
        'Set setLdoSoftStartCurrentLimit index: %p',
        async index => {
            await pmic.ldoModule[index].set.softStartCurrent?.(10, 'LDO');
            await pmic.ldoModule[index].set.softStartCurrent?.(
                10,
                'Load_switch',
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(2);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStartCurrent: 10 },
                index,
            });
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Set setLdoSoftStartTime index: %p',
        async index => {
            await pmic.ldoModule[index].set.softStartTime?.(4.5);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStartTime: 4.5 },
                index,
            });
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Set setLdoActiveDischarge index: %p',
        async index => {
            await pmic.ldoModule[index].set.activeDischarge?.(true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { activeDischarge: true },
                index,
            });
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Set setLdoOvercurrentProtection index: %p',
        async index => {
            await pmic.ldoModule[index].set.overcurrentProtection?.(true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { overcurrentProtection: true },
                index,
            });
        },
    );

    test.each(PMIC_1012_LDOS)(
        'Set setLdoOnOffControl index: %p',
        async index => {
            await pmic.ldoModule[index].set.onOffControl?.('Software');

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'Software',
                },
                index,
            });
        },
    );

    test.each(PMIC_1012_LDOS)('Set setLdoVOutSel index: %p', async index => {
        await pmic.ldoModule[index].set.vOutSel?.('Software');

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { vOutSel: 'Software' },
            index,
        });
    });

    test.each(PMIC_1012_LDOS)(
        'Set setLdoWeakPullDown index: %p',
        async index => {
            await pmic.ldoModule[index].set.weakPullDown?.(true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { weakPullDown: true },
                index,
            });
        },
    );
});

export {};
