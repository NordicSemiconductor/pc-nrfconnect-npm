/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Boost,
    BoostExport,
    BoostModeControlValues,
    BoostPinModeValues,
    BoostPinSelectionValues,
    BoostVOutSelValues,
} from '../../types';
import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 2100 - Boost Setters Offline tests', () => {
    const { mockOnBoostUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set all', async () => {
        const expected: BoostExport = {
            vOutSoftware: 2.7,
            vOutSelect: 'Software',
            modeControl: 'HP',
            pinSelection: 'GPIO1HI',
            pinMode: 'NOHP',
            overCurrentProtection: true,
        };

        await pmic.boostModule[0].set.all(expected);

        let result: Partial<Boost> = {};
        mockOnBoostUpdate.mockImplementation(p => {
            result = { ...result, ...p };
        });

        expect(mockOnBoostUpdate).toBeCalledTimes(6);
        expect(result).toStrictEqual(result);
    });

    test('Set vOut', async () => {
        await pmic.boostModule[0].set.vOut(2.7);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: { vOutSelect: 'Software', vOutSoftware: 2.7 },
            index: 0,
        });
    });

    test.each(BoostVOutSelValues)('Set vOutSel', async vOutSelect => {
        await pmic.boostModule[0].set.vOutSel(vOutSelect);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: { vOutSelect },
            index: 0,
        });
    });

    test.each(BoostModeControlValues)('Set modeControl', async modeControl => {
        await pmic.boostModule[0].set.modeControl(modeControl);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: { modeControl },
            index: 0,
        });
    });

    test.each(BoostPinSelectionValues)(
        'Set pinSelection',
        async pinSelection => {
            await pmic.boostModule[0].set.pinSelection(pinSelection);

            expect(mockOnBoostUpdate).toBeCalledTimes(1);
            expect(mockOnBoostUpdate).toBeCalledWith({
                data: { pinSelection, pinModeEnabled: pinSelection !== 'OFF' },
                index: 0,
            });
        },
    );

    test.each(BoostPinModeValues)('Set pinMode', async pinMode => {
        await pmic.boostModule[0].set.pinMode(pinMode);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: { pinMode },
            index: 0,
        });
    });

    test.each([true, false])('Set pinMode', async overCurrentProtection => {
        await pmic.boostModule[0].set.overCurrent(overCurrentProtection);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: { overCurrentProtection },
            index: 0,
        });
    });
});

export {};
