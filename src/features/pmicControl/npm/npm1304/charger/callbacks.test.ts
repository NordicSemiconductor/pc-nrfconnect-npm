/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { NTCThermistor, PmicChargingState } from '../../types';
import { setupMocksWithShellParser } from '../tests/helpers';
import { ITermValues } from './types';

describe('PMIC 1304 - Command callbacks', () => {
    const { eventHandlers, mockOnChargerUpdate, mockOnChargingStatusUpdate } =
        setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test.each(['get', 'set 2300'])(
        'npmx charger termination_voltage normal %p',
        append => {
            const command = `npmx charger termination_voltage normal ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 2300 mv', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 2.3 });
        }
    );

    test.each(['get', 'set 400'])(
        'npmx charger charging_current %p',
        append => {
            const command = `npmx charger charging_current ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 400000 mA', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { iChg: 400 });
        }
    );

    test.each(['get', 'set 1'])('npmx charger enable recharging %p', append => {
        const command = `npmx charger module recharge ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 1.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            enableRecharging: true,
        });
    });

    test.each(['get', 'set 1'])('powerup_charger vbatlow %p', append => {
        const command = `powerup_charger vbatlow ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 1.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            enableVBatLow: true,
        });
    });

    test.each(
        ITermValues.flatMap(v => [
            { append: 'get', v },
            { append: `set ${v}%`, v },
        ])
    )('npmx charger iTerm %p', ({ append, v }) => {
        const command = `npmx charger termination_current ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${v}%`, command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { iTerm: v });
    });

    test.each(['get', 'set 1340'])('npmx charger iBatLim %p', append => {
        const command = `npm_adc fullscale ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 1340mA.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { iBatLim: 1340 });
    });

    test('npmx charger iBatLim apx result', () => {
        const command = `npm_adc fullscale set 200`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(
            'Info: Requested value was 200 but reading will return 300 due to approximations.',
            command
        );

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { iBatLim: 200 });
    });

    test.each(['get', 'set 100'])('npmx charger die_temp resume %p', append => {
        const command = `npmx charger die_temp resume ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100 *C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tChgResume: 100,
        });
    });

    test.each(['get', 'set 100'])('npmx charger die_temp stop %p', append => {
        const command = `npmx charger die_temp stop ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100 *C', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            tChgStop: 100,
        });
    });

    test.each([
        {
            append: 'get',
            successReturn: 'Value: 47000.',
            ntcThermistor: '47 kΩ' as NTCThermistor,
        },
        {
            append: 'set 47000',
            successReturn: 'Value: 47000.',
            ntcThermistor: '47 kΩ' as NTCThermistor,
        },
        {
            append: 'set 10000',
            successReturn: 'Value: 10000.',
            ntcThermistor: '10 kΩ' as NTCThermistor,
        },
        {
            append: 'set 100000',
            successReturn: 'Value: 100000.',
            ntcThermistor: '100 kΩ' as NTCThermistor,
        },
        {
            append: 'set 0',
            successReturn: 'Value: 0.',
            ntcThermistor: 'Ignore NTC' as NTCThermistor,
        },
    ])(
        'npmx charger ntc thermistor %p',
        ({ append, successReturn, ntcThermistor }) => {
            const command = `npmx adc ntc type ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess(successReturn, command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, { ntcThermistor });
        }
    );

    test.each(['get', 'set 100'])('npmx charger ntc beta %p', append => {
        const command = `npmx adc ntc beta ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess('Value: 100.', command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, {
            ntcBeta: 100,
        });
    });

    test.each(
        [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80]
            .map(setValue => [
                {
                    append: 'get',
                    value: setValue,
                },
            ])
            .flat()
    )('npmx charger status %p', ({ append, value }) => {
        const command = `npmx charger status all ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${value}`, command);

        expect(mockOnChargingStatusUpdate).toBeCalledTimes(1);
        expect(mockOnChargingStatusUpdate).toBeCalledWith({
            // eslint-disable-next-line no-bitwise
            batteryDetected: (value & 0x01) > 0,
            // eslint-disable-next-line no-bitwise
            batteryFull: (value & 0x02) > 0,
            // eslint-disable-next-line no-bitwise
            trickleCharge: (value & 0x04) > 0,
            // eslint-disable-next-line no-bitwise
            constantCurrentCharging: (value & 0x08) > 0,
            // eslint-disable-next-line no-bitwise
            constantVoltageCharging: (value & 0x10) > 0,
            // eslint-disable-next-line no-bitwise
            batteryRechargeNeeded: (value & 0x20) > 0,
            // eslint-disable-next-line no-bitwise
            dieTempHigh: (value & 0x40) > 0,
            // eslint-disable-next-line no-bitwise
            supplementModeActive: (value & 0x80) > 0,
        } as PmicChargingState);
    });

    test.each(
        [true, false]
            .map(enabled => [
                {
                    append: 'get',
                    enabled,
                },
                {
                    append: `set ${enabled ? '1' : '0'}`,
                    enabled,
                },
            ])
            .flat()
    )('npmx charger module charger %p', ({ append, enabled }) => {
        const command = `npmx charger module charger ${append}`;
        const callback =
            eventHandlers.mockRegisterCommandCallbackHandler(command);

        callback?.onSuccess(`Value: ${enabled ? '1' : '0'}`, command);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { enabled });
    });

    test.each(['get', 'set 3550'])(
        'npmx charger termination_voltage warm %p',
        append => {
            const command = `npmx charger termination_voltage warm ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 3550 mV', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                vTermR: 3.55,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature cold %p',
        append => {
            const command = `npmx charger ntc_temperature cold ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tCold: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature cool %p',
        append => {
            const command = `npmx charger ntc_temperature cool ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tCool: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature warm %p',
        append => {
            const command = `npmx charger ntc_temperature warm ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tWarm: 20,
            });
        }
    );

    test.each(['get', 'set 20'])(
        'npmx charger ntc_temperature hot %p',
        append => {
            const command = `npmx charger ntc_temperature hot ${append}`;
            const callback =
                eventHandlers.mockRegisterCommandCallbackHandler(command);

            callback?.onSuccess('Value: 20 *C', command);

            expect(mockOnChargerUpdate).toBeCalledTimes(1);
            expect(mockOnChargerUpdate).nthCalledWith(1, {
                tHot: 20,
            });
        }
    );
});
export {};
