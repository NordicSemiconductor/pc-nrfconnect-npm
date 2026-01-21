/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { helpers } from '../../tests/helpers';
import { PmicDialog } from '../../types';
import { PMIC_1300_BUCKS, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Setters Online tests', () => {
    const { mockDialogHandler, mockOnBuckUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess,
            );
        });

        test.each(PMIC_1300_BUCKS)('Set setBuckVOut index: %p', async index => {
            await pmic.buckModule[index].set.vOutNormal(1.8);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set ${index} 1800`,
                expect.anything(),
                undefined,
                true,
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout_select set ${index} 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckVOut index: 1 with warning - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel?.();
            });

            await expect(
                pmic.buckModule[1].set.vOutNormal(1.6),
            ).rejects.toBeUndefined();

            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckVOut index: 1 with warning - confirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.buckModule[1].set.vOutNormal(1.6);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set 1 1600`,
                expect.anything(),
                undefined,
                true,
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout_select set 1 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckVOut index: 1 with warning - yes, don't ask", async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog?.onOptional) dialog.onOptional();
            });

            await pmic.buckModule[1].set.vOutNormal(1.6);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck voltage normal set 1 1600`,
                expect.anything(),
                undefined,
                true,
            );

            // change from vSet to Software
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck vout_select set 1 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionVOut index: %p',
            async index => {
                await pmic.buckModule[index].set.vOutRetention?.(1.8);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck voltage retention set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)('Set setBuckMode - vSet', async index => {
            await pmic.buckModule[index].set.mode('vSet');

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set ${index} 0`,
                expect.anything(),
                undefined,
                true,
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get ${index}`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckMode index: 1 with software - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel?.();
            });

            await expect(
                pmic.buckModule[1].set.mode('software'),
            ).rejects.toBeUndefined();

            expect(mockDialogHandler).toBeCalledTimes(1);

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckMode index: 1 with software - confirm', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.buckModule[1].set.mode('software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set 1 1`,
                expect.anything(),
                undefined,
                true,
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckMode index: 1 with software - yes, don't ask", async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog.onOptional) dialog.onOptional();
            });

            await pmic.buckModule[1].set.mode('software');
            expect(mockDialogHandler).toBeCalledTimes(1);

            // on cancel we should update ui
            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck vout_select set 1 1`,
                expect.anything(),
                undefined,
                true,
            );

            // We need to request the buckVOut
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npmx buck voltage normal get 1`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckModeControl index: %p',
            async index => {
                await pmic.buckModule[index].set.modeControl('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `powerup_buck mode set ${index} GPIO2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckOnOffControl index: %p',
            async index => {
                await pmic.buckModule[index].set.onOffControl('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio on_off index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionControl index: %p',
            async index => {
                await pmic.buckModule[index].set.retentionControl?.('GPIO2');

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npmx buck gpio retention index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckEnabled index: %p',
            async index => {
                await pmic.buckModule[index].set.enabled(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck status set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckActiveDischargeEnabled index: %p',
            async index => {
                await pmic.buckModule[index].set.activeDischarge?.(true);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck active_discharge set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test('Set setBuckEnabled index: 1 false - cancel', async () => {
            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onCancel?.();
            });

            await expect(
                pmic.buckModule[1].set.enabled(false),
            ).rejects.toBeUndefined();
            expect(mockDialogHandler).toBeCalledTimes(1);

            // No need to request UI update
            expect(mockEnqueueRequest).toBeCalledTimes(0);

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test("Set setBuckEnabled index: 1 false -  yes, don't ask", async () => {
            mockEnqueueRequest.mockClear();

            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                dialog.onConfirm();
            });

            await pmic.buckModule[1].set.enabled(false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck status set 1 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });

        test('Set setBuckEnabled index: 1 false - confirm', async () => {
            mockEnqueueRequest.mockClear();

            mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
                if (dialog.onOptional) dialog.onOptional();
            });

            await pmic.buckModule[1].set.enabled(false);
            expect(mockDialogHandler).toBeCalledTimes(1);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npmx buck status set 1 0`,
                expect.anything(),
                undefined,
                true,
            );

            // Updates should only be emitted when we get response
            expect(mockOnBuckUpdate).toBeCalledTimes(0);
        });
    });
    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError,
            );
        });
        test.each(PMIC_1300_BUCKS)(
            'Set setBuckVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.vOutNormal(1.8),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage normal get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckVOut - Fail on second command - index: %p',
            async index => {
                mockEnqueueRequest.mockImplementationOnce(
                    helpers.registerCommandCallbackSuccess,
                );

                await expect(
                    pmic.buckModule[index].set.vOutNormal(1.8),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(3);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage normal set ${index} 1800`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // change from vSet to Software
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout_select set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    3,
                    `npmx buck vout_select get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionVOut - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.vOutRetention?.(1.7),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck voltage retention set ${index} 1700`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck voltage retention get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckMode - Fail immediately - vSet',
            async index => {
                await expect(
                    pmic.buckModule[index].set.mode('vSet'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck vout_select set ${index} 0`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck vout_select get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckModeControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.modeControl('GPIO2'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `powerup_buck mode set ${index} GPIO2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `powerup_buck mode get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckOnOffControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.onOffControl('GPIO2'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio on_off index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio on_off index get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckRetentionControl - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.retentionControl?.('GPIO2'),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck gpio retention index set ${index} 2`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck gpio retention index get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckEnabled - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.enabled(true),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck status set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck status get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );

        test.each(PMIC_1300_BUCKS)(
            'Set setBuckActiveDischargeEnabled - Fail immediately - index: %p',
            async index => {
                await expect(
                    pmic.buckModule[index].set.activeDischarge?.(true),
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).nthCalledWith(
                    1,
                    `npmx buck active_discharge set ${index} 1`,
                    expect.anything(),
                    undefined,
                    true,
                );

                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npmx buck active_discharge get ${index}`,
                    expect.anything(),
                    undefined,
                    true,
                );

                // Updates should only be emitted when we get response
                expect(mockOnBuckUpdate).toBeCalledTimes(0);
            },
        );
    });
});

export {};
