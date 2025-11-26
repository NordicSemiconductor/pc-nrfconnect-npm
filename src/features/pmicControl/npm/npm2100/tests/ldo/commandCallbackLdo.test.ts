/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    nPM2100GPIOControlPinSelectValues,
    nPM2100LdoModeControlValues,
    nPM2100SoftStartValues,
} from '../../types';
import { PMIC_2100_LDOS, setupMocksWithShellParser } from '../helpers';

describe('PMIC 2100 - Command callbacks - LDO', () => {
    const { eventHandlers, mockOnLdoUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('LDO/Load Switch enabled', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[true, false].map(enabled =>
                    [
                        {
                            index,
                            append: `get`,
                            enabled,
                        },
                        {
                            index,
                            append: `set ${enabled ? 'ON' : 'OFF'} `,
                            enabled,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw enable %p', ({ index, append, enabled }) => {
            const command = `npm2100 ldosw enable ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${enabled ? 'ON' : 'OFF'}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { enabled },
                index,
            });
        });
    });

    // Set VOUT voltage
    describe('LDOSW VOUT voltages', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                [
                    {
                        index,
                        append: `get `,
                    },
                    {
                        index,
                        append: `set 1300`,
                    },
                ].flat(),
            ]).flat(),
        )('npm2100 ldosw vout %p', ({ index, append }) => {
            const command = `npm2100 ldosw vout ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: 1300mV`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { voltage: 1.3 },
                index,
            });
        });
    });

    // Mode
    describe('LDOSW mode', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...['LDO', 'Load_switch'].map(mode =>
                    [
                        {
                            index,
                            append: `get`,
                            mode,
                        },
                        {
                            index,
                            append: `set ${mode}`,
                            mode,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw mode %p', ({ index, append, mode }) => {
            const command = `npm2100 ldosw mode ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value:  ${mode}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { mode },
                index,
            });
        });
    });

    // modectrl
    describe('LDOSW modectrl', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[...nPM2100LdoModeControlValues].map(modeControl =>
                    [
                        {
                            index,
                            append: `get`,
                            modeControl,
                        },
                        {
                            index,
                            append: `set ${modeControl}`,
                            modeControl,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw modectrl %p', ({ index, append, modeControl }) => {
            const command = `npm2100 ldosw modectrl ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value:  ${modeControl}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: {
                    modeControl,
                },
                index,
            });
        });
    });

    // Pin select
    describe('LDOSW pin select', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[...nPM2100GPIOControlPinSelectValues].map(pinSel =>
                    [
                        {
                            index,
                            append: `get`,
                            pinSel,
                        },
                        {
                            index,
                            append: `set ${pinSel}`,
                            pinSel,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw pinsel %p', ({ index, append, pinSel }) => {
            const command = `npm2100 ldosw pinsel ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value:  ${pinSel}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { pinSel },
                index,
            });
        });
    });

    // LDO Softstart
    describe('LDO soft start', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...['25mA', '38mA', '50mA', '75mA', '150mA'].map(current => [
                    {
                        index,
                        append: `get `,
                        enabled: current,
                    },
                    {
                        index,
                        append: `set ${current} `,
                        enabled: current,
                    },
                ]),
            ]).flat(),
        )(
            'npm2100 ldosw softstart LDO %p',
            ({ index, append, enabled: current }) => {
                const command = `npm2100 ldosw softstart LDO ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess(`Value: ${current}`, command);

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
                expect(mockOnLdoUpdate).toBeCalledWith({
                    data: { ldoSoftStart: current },
                    index,
                });
            },
        );
    });

    // Load switch softstart
    describe('Load Switch soft start', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...nPM2100SoftStartValues.map(value => [
                    {
                        index,
                        append: `get `,
                        value,
                    },
                    {
                        index,
                        append: `set ${value} `,
                        value,
                    },
                ]),
            ]).flat(),
        )('npm2100 ldosw softstart LOADSW %p', ({ index, append, value }) => {
            const command = `npm2100 ldosw softstart LOADSW ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(`Value: ${value}`, command);

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { softStart: value },
                index,
            });
        });
    });

    // OCP
    describe('OCP', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[true, false].map(ocpEnabled =>
                    [
                        {
                            index,
                            append: `get`,
                            activeDischarge: ocpEnabled,
                        },
                        {
                            index,
                            append: `set ${ocpEnabled ? '1' : '0'} `,
                            activeDischarge: ocpEnabled,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )(
            'npm2100 ldosw ocp %p',
            ({ index, append, activeDischarge: ocpEnabled }) => {
                const command = `npm2100 ldosw ocp ${append}`;
                const callback =
                    eventHandlers.mockRegisterCommandCallbackHandler(command);

                callback?.onSuccess(
                    `Value: ${ocpEnabled ? 'ON' : 'OFF'}`,
                    command,
                );

                expect(mockOnLdoUpdate).toBeCalledTimes(1);
                expect(mockOnLdoUpdate).toBeCalledWith({
                    data: { ocpEnabled },
                    index,
                });
            },
        );
    });

    // LDO Ramp
    describe('LDO Ramp', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[true, false].map(rampEnabled =>
                    [
                        {
                            index,
                            append: `get`,
                            rampEnabled,
                        },
                        {
                            index,
                            append: `set ${rampEnabled ? 'ON' : 'OFF'} `,
                            rampEnabled,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw ldoramp %p', ({ index, append, rampEnabled }) => {
            const command = `npm2100 ldosw ldoramp ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                `Value: ${rampEnabled ? 'ON' : 'OFF'}`,
                command,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { rampEnabled },
                index,
            });
        });
    });

    // LDO Ramp Halt
    describe('LDO Ramp Halt', () => {
        test.each(
            PMIC_2100_LDOS.map(index => [
                ...[true, false].map(haltEnabled =>
                    [
                        {
                            index,
                            append: `get`,
                            haltEnabled,
                        },
                        {
                            index,
                            append: `set ${haltEnabled ? 'ON' : 'OFF'} `,
                            haltEnabled,
                        },
                    ].flat(),
                ),
            ]).flat(),
        )('npm2100 ldosw ldohalt %p', ({ index, append, haltEnabled }) => {
            const command = `npm2100 ldosw ldohalt ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                `Value: ${haltEnabled ? 'ON' : 'OFF'}`,
                command,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { haltEnabled },
                index,
            });
        });
    });
});
