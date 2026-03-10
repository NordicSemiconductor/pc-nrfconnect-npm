/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';
import { ITermValues } from './types';

describe('PMIC 1012 - Command callbacks', () => {
    const { eventHandlers, mockOnChargerUpdate } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(['get', 'set 2.3V'])(
        'npm1012 charger voltage termination %p',
        append => {
            const command = `npm1012 charger voltage termination ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2.3V', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 2.3 });
        },
    );

    test.each(['get', 'set 40.5mA'])(
        'npm1012 charger current charge %p',
        append => {
            const command = `npm1012 charger current charge ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 40.5mA', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { iChg: 40.5 });
        },
    );

    test.each(['get', 'set ON'])('npm1012 charger recharge %p', append => {
        const command = `npm1012 charger recharge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: ON', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            enableRecharging: true,
        });
    });

    test.each(['get', 'set ON'])(
        'npm1012 charger lowbat_charging %p',
        append => {
            const command = `npm1012 charger lowbat_charging ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: ON', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                enableVBatLow: true,
            });
        },
    );

    test.each(
        ITermValues.flatMap(v => [
            { append: 'get', v },
            { append: `set ${v}%`, v },
        ]),
    )('npm1012 charger current termination %p', ({ append, v }) => {
        const command = `npm1012 charger current termination ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${v}%`, command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { iTerm: v });
    });

    test.each(['get', 'set 100'])(
        'npm1012 charger dietemp reduce %p',
        append => {
            const command = `npm1012 charger dietemp reduce ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 100C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tChgReduce: 100,
            });
        },
    );

    test.each(['get', 'set 100'])(
        'npm1012 charger dietemp resume %p',
        append => {
            const command = `npm1012 charger dietemp resume ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 100C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tChgResume: 100,
            });
        },
    );

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get',
                    enabled,
                },
                {
                    append: `set ${enabled ? 'on' : 'off'}`,
                    enabled,
                },
            ])
            .flat(),
    )('npm1012 charger enable %p', ({ append, enabled }) => {
        const command = `npm1012 charger enable ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? 'on' : 'off'}`, command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { enabled });
    });

    test.each(['get', 'set -20C'])('npm1012 charger ntc cold %p', append => {
        const command = `npm1012 charger ntc cold ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: -20C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tCold: -20,
        });
    });

    test.each(['get', 'set 20C'])('npm1012 charger ntc cool %p', append => {
        const command = `npm1012 charger ntc cool ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 20C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tCool: 20,
        });
    });

    test.each(['get', 'set 20C'])('npm1012 charger ntc warm %p', append => {
        const command = `npm1012 charger ntc warm ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 20C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tWarm: 20,
        });
    });

    test.each(['get', 'set 20C'])('npm1012 charger ntc hot %p', append => {
        const command = `npm1012 charger ntc hot ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 20C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tHot: 20,
        });
    });
});
export {};
