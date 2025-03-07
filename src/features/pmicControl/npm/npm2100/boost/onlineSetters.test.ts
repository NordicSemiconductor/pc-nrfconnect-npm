/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParserCallbacks } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    BoostModeControlValues,
    BoostPinModeValues,
    BoostPinSelectionValues,
    BoostVOutSelValues,
} from '../../types';
import { helpers, setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Boost Setters Online tests', () => {
    const { mockOnBoostUpdate, mockEnqueueRequest, pmic } =
        setupMocksWithShellParser();
    describe('Setters and effects state - success', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackSuccess
            );
        });

        test('Set vOut: %p', async () => {
            await pmic.boostModule[0].set.vOut(2.7);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm2100 boost voutsel set Software`,
                expect.anything(),
                undefined,
                true
            );
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 boost vout SOFTWARE set 2700`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });

        test.each(BoostVOutSelValues)('Set vOutSel: %p', async vSelect => {
            await pmic.boostModule[0].set.vOutSel(vSelect);

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).nthCalledWith(
                1,
                `npm2100 boost voutsel set ${vSelect}`,
                expect.anything(),
                undefined,
                true
            );
            if (vSelect === 'Software') {
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost vout SOFTWARE get`,
                    expect.anything(),
                    undefined,
                    true
                );
            } else {
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost vout VSET get`,
                    expect.anything(),
                    undefined,
                    true
                );
            }

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });

        test.each(BoostModeControlValues)(
            'Set modeControl: %p',
            async modeControl => {
                await pmic.boostModule[0].set.modeControl(modeControl);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost mode set ${modeControl}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each(BoostPinSelectionValues)(
            'Set pinSelection: %p',
            async pinSelect => {
                await pmic.boostModule[0].set.pinSelection(pinSelect);

                expect(mockEnqueueRequest).toBeCalledTimes(1);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost pinsel set ${pinSelect}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each(BoostPinModeValues)('Set pinMode: %p', async pinMode => {
            await pmic.boostModule[0].set.pinMode(pinMode);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 boost pinmode set ${pinMode}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });

        test.each([true, false])('Set overCurrent: %p', async enabled => {
            await pmic.boostModule[0].set.overCurrent(enabled);

            expect(mockEnqueueRequest).toBeCalledTimes(1);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 boost ocp set ${enabled ? 'ON' : 'OFF'}`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });
    });

    describe('Setters and effects state - error', () => {
        beforeEach(() => {
            jest.clearAllMocks();

            mockEnqueueRequest.mockImplementation(
                helpers.registerCommandCallbackError
            );
        });

        test('Set vOut - Fail immediately', async () => {
            await expect(
                pmic.boostModule[0].set.vOut(2.7)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(2);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 boost voutsel set Software`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 boost voutsel get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });

        test.only('Set vOut - Fail on 2nd Call', async () => {
            const value = 2.7;
            const command = `npm2100 boost vout SOFTWARE set ${value * 1000}`;

            mockEnqueueRequest
                .mockImplementationOnce(helpers.registerCommandCallbackSuccess)
                .mockImplementationOnce(
                    (_command: string, callback?: ShellParserCallbacks) => {
                        callback?.onError('Error: Error case', command);
                        return Promise.resolve();
                    }
                );

            await expect(
                pmic.boostModule[0].set.vOut(value)
            ).rejects.toBeUndefined();

            expect(mockEnqueueRequest).toBeCalledTimes(3);
            expect(mockEnqueueRequest).toBeCalledWith(
                `npm2100 boost voutsel set Software`,
                expect.anything(),
                undefined,
                true
            );

            // set the vout as needed
            expect(mockEnqueueRequest).nthCalledWith(
                2,
                `npm2100 boost vout SOFTWARE set 2700`,
                expect.anything(),
                undefined,
                true
            );

            // Refresh data due to error
            expect(mockEnqueueRequest).nthCalledWith(
                3,
                `npm2100 boost vout SOFTWARE get`,
                expect.anything(),
                undefined,
                true
            );

            // Updates should only be emitted when we get response
            expect(mockOnBoostUpdate).toBeCalledTimes(0);
        });

        test.each(BoostVOutSelValues)(
            'Set vOutSel - Fail immediately',
            async vSelect => {
                await expect(
                    pmic.boostModule[0].set.vOutSel(vSelect)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost voutsel set ${vSelect}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost voutsel get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each(BoostModeControlValues)(
            'Set modeControl - Fail immediately',
            async modeControl => {
                await expect(
                    pmic.boostModule[0].set.modeControl(modeControl)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost mode set ${modeControl}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost mode get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each(BoostPinSelectionValues)(
            'Set pinSelection - Fail immediately',
            async pinSelection => {
                await expect(
                    pmic.boostModule[0].set.pinSelection(pinSelection)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost pinsel set ${pinSelection}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost pinsel get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each(BoostPinModeValues)(
            'Set pinSelection - Fail immediately',
            async pinMode => {
                await expect(
                    pmic.boostModule[0].set.pinMode(pinMode)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost pinmode set ${pinMode}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost pinmode get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );

        test.each([true, false])(
            'Set overCurrent - Fail immediately',
            async overCurrent => {
                await expect(
                    pmic.boostModule[0].set.overCurrent(overCurrent)
                ).rejects.toBeUndefined();

                expect(mockEnqueueRequest).toBeCalledTimes(2);
                expect(mockEnqueueRequest).toBeCalledWith(
                    `npm2100 boost ocp set ${overCurrent ? 'ON' : 'OFF'}`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Refresh data due to error
                expect(mockEnqueueRequest).nthCalledWith(
                    2,
                    `npm2100 boost ocp get`,
                    expect.anything(),
                    undefined,
                    true
                );

                // Updates should only be emitted when we get response
                expect(mockOnBoostUpdate).toBeCalledTimes(0);
            }
        );
    });
});

export {};
