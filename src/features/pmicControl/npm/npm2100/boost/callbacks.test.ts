/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BoostModeControlValues,
    BoostPinModeValues,
    BoostPinSelectionValues,
    BoostVOutSelValues,
} from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Boosts callbacks', () => {
    const { eventHandlers, mockOnBoostUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('npm2100 boost vout VSET get', () => {
        const command = `npm2100 boost vout VSET get`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 3000 mV.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                vOutVSet: 3,
            },
            index: 0,
        });
    });

    test.each([`get 0`, `set 0 3000`])(
        'npm2100 boost vout SOFTWARE: %p',
        append => {
            const command = `npm2100 boost vout SOFTWARE ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: 3000 mV.`, command);

            expect(mockOnBoostUpdate).toBeCalledTimes(1);
            expect(mockOnBoostUpdate).toBeCalledWith({
                data: {
                    vOutSoftware: 3,
                },
                index: 0,
            });
        },
    );

    test.each(
        BoostVOutSelValues.map(vOutSelect => [
            { append: `get 0`, vOutSelect },
            { append: `set ${vOutSelect}`, vOutSelect },
        ]).flat(),
    )('npm2100 boost voutsel: %p', ({ append, vOutSelect }) => {
        const command = `npm2100 boost voutsel ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${vOutSelect}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                vOutSelect,
            },
            index: 0,
        });
    });

    test.each(
        BoostModeControlValues.map(modeControl => [
            { append: `get 0`, modeControl },
            { append: `set ${modeControl}`, modeControl },
        ]).flat(),
    )('npm2100 boost mode (control): %p', ({ append, modeControl }) => {
        const command = `npm2100 boost mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${modeControl}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                modeControl,
            },
            index: 0,
        });
    });

    test.each(
        BoostPinSelectionValues.map(pinSelection => [
            { append: `get 0`, pinSelection },
            { append: `set ${pinSelection}`, pinSelection },
        ]).flat(),
    )('npm2100 boost pinsel: %p', ({ append, pinSelection }) => {
        const command = `npm2100 boost pinsel ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${pinSelection}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                pinSelection,
                pinModeEnabled: pinSelection !== 'OFF',
            },
            index: 0,
        });
    });

    test.each(
        BoostPinModeValues.map(pinMode => [
            { append: `get 0`, pinMode },
            { append: `set ${pinMode}`, pinMode },
        ]).flat(),
    )('npm2100 boost pinmode: %p', ({ append, pinMode }) => {
        const command = `npm2100 boost pinmode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${pinMode}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                pinMode,
            },
            index: 0,
        });
    });

    test.each(
        BoostPinModeValues.map(pinMode => [
            { append: `get 0`, pinMode },
            { append: `set ${pinMode}`, pinMode },
        ]).flat(),
    )('npm2100 boost pinmode: %p', ({ append, pinMode }) => {
        const command = `npm2100 boost pinmode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${pinMode}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                pinMode,
            },
            index: 0,
        });
    });

    test.each(
        ['ON', 'OFF']
            .map(enabled => [
                { append: `get 0`, enabled },
                { append: `set ${enabled}`, enabled },
            ])
            .flat(),
    )('npm2100 boost ocp: %p', ({ append, enabled }) => {
        const command = `npm2100 boost ocp ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled}.`, command);

        expect(mockOnBoostUpdate).toBeCalledTimes(1);
        expect(mockOnBoostUpdate).toBeCalledWith({
            data: {
                overCurrentProtection: enabled === 'ON',
            },
            index: 0,
        });
    });
});

export {};
