/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { PmicDialog } from '../../types';
import { PMIC_1304_LDOS, setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1304 - Setters Offline tests', () => {
    const { mockDialogHandler, mockOnLdoUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(PMIC_1304_LDOS)('Set setLdoVoltage index: %p', async index => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.ldoModule[index].set.voltage(1.2);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.2 },
            index,
        });
    });

    test.each(PMIC_1304_LDOS)('Set setLdoEnabled index: %p', async index => {
        await pmic.ldoModule[index].set.enabled(false);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled: false },
            index,
        });
    });

    test.each(PMIC_1304_LDOS)(
        'Set setLdoSoftStartEnabled index: %p',
        async index => {
            await pmic.ldoModule[index].set.softStartEnabled?.(true);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStartEnabled: true },
                index,
            });
        },
    );

    test.each(PMIC_1304_LDOS)('Set setLdoSoftStart index: %p', async index => {
        await pmic.ldoModule[index].set.softStart?.(25);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStart: 25 },
            index,
        });
    });

    test.each(PMIC_1304_LDOS)(
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

    test.each(PMIC_1304_LDOS)(
        'Set setLdoOnOffControl index: %p',
        async index => {
            await pmic.ldoModule[index].set.onOffControl?.('SW');

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: {
                    onOffControl: 'SW',
                    onOffSoftwareControlEnabled: true,
                },
                index,
            });
        },
    );
});

export {};
