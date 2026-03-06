/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LdoVOutSelValues } from '../../types';
import { PMIC_1012_LDOS, setupMocksWithShellParser } from '../tests/helpers';
import { onOffControlValues } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnLdoUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...[true, false].map(enabled =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        enabled,
                    },
                    {
                        index,
                        append: `set ${index} ${enabled ? 'on' : 'off'} `,
                        enabled,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw %p', ({ index, append, enabled }) => {
        const command = `npm1012 ldosw enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { enabled },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 1.5`,
                },
            ].flat(),
        ]).flat(),
    )('npm1012 ldosw vout software %p', ({ index, append }) => {
        const command = `npm1012 ldosw vout software ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 1.5V`, command);

        // Load Switch 2
        if (index === 1) {
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
            return;
        }

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { voltage: 1.5 },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...['LDO', 'Load_switch'].map(mode =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        mode,
                    },
                    {
                        index,
                        append: `set ${index} ${mode} `,
                        mode,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw mode %p', ({ index, append, mode }) => {
        const command = `npm1012 ldosw mode ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value:  ${mode}.`, command);

        // Load Switch 2
        if (index === 1) {
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
            return;
        }

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { mode },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...[true, false].map(enabled =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        enabled,
                    },
                    {
                        index,
                        append: `set ${index} ${enabled ? 'on' : 'off'} `,
                        enabled,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw softstart %p', ({ index, append, enabled }) => {
        const command = `npm1012 ldosw softstart ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStart: enabled },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 10`,
                },
            ].flat(),
        ]).flat(),
    )('npm1012 ldosw softstartilim %p', ({ index, append }) => {
        const command = `npm1012 ldosw softstartilim ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 10mA`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStartCurrent: 10 },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            [
                {
                    index,
                    append: `get ${index}`,
                },
                {
                    index,
                    append: `set ${index} 4.5`,
                },
            ].flat(),
        ]).flat(),
    )('npm1012 ldosw softstarttime %p', ({ index, append }) => {
        const command = `npm1012 ldosw softstarttime ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: 4.5ms`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { softStartTime: 4.5 },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...[true, false].map(activeDischarge =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        activeDischarge,
                    },
                    {
                        index,
                        append: `set ${index} ${activeDischarge ? 'on' : 'off'} `,
                        activeDischarge,
                    },
                ].flat(),
            ),
        ]).flat(),
    )(
        'npm1012 ldosw activedischarge %p',
        ({ index, append, activeDischarge }) => {
            const command = `npm1012 ldosw activedischarge ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(
                `Value: ${activeDischarge ? 'on' : 'off'}`,
                command,
            );

            expect(mockOnLdoUpdate).toBeCalledTimes(1);
            expect(mockOnLdoUpdate).toBeCalledWith({
                data: { activeDischarge },
                index,
            });
        },
    );

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...[true, false].map(ocp =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        ocp,
                    },
                    {
                        index,
                        append: `set ${index} ${ocp ? 'on' : 'off'} `,
                        ocp,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw ocp %p', ({ index, append, ocp }) => {
        const command = `npm1012 ldosw ocp ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${ocp ? 'on' : 'off'}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { overcurrentProtection: ocp },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...onOffControlValues.map(value =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        value,
                    },
                    {
                        index,
                        append: `set ${index} ${value}`,
                        value,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw enablectrl %p', ({ index, append, value }) => {
        const command = `npm1012 ldosw enablectrl ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: {
                onOffControl: value,
            },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...LdoVOutSelValues.map(value =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        value,
                    },
                    {
                        index,
                        append: `set ${index} ${value}`,
                        value,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw voutsel %p', ({ index, append, value }) => {
        const command = `npm1012 ldosw voutsel ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        // Load Switch 2
        if (index === 1) {
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
            return;
        }

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: {
                vOutSel: value,
            },
            index,
        });
    });

    test.each(
        PMIC_1012_LDOS.map(index => [
            ...[true, false].map(weakPullDown =>
                [
                    {
                        index,
                        append: `get ${index}`,
                        weakPullDown,
                    },
                    {
                        index,
                        append: `set ${index} ${weakPullDown ? 'on' : 'off'} `,
                        weakPullDown,
                    },
                ].flat(),
            ),
        ]).flat(),
    )('npm1012 ldosw weakpull %p', ({ index, append, weakPullDown }) => {
        const command = `npm1012 ldosw weakpull ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${weakPullDown ? 'on' : 'off'}`, command);

        // Load Switch 2
        if (index === 1) {
            expect(mockOnLdoUpdate).toBeCalledTimes(0);
            return;
        }

        expect(mockOnLdoUpdate).toBeCalledTimes(1);
        expect(mockOnLdoUpdate).toBeCalledWith({
            data: { weakPullDown },
            index,
        });
    });
});
export {};
