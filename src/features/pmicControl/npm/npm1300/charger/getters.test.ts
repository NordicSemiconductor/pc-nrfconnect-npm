/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1300 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update pmicChargingState', () => {
        pmic.chargerModule?.get.state();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger status all get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerVTerm', () => {
        pmic.chargerModule?.get.vTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage normal get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerIChg', () => {
        pmic.chargerModule?.get.iChg();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger charging_current get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerEnabled', () => {
        pmic.chargerModule?.get.enabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module charger get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerVTrickleFast', () => {
        pmic.chargerModule?.get.vTrickleFast();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger trickle_voltage get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerITerm', () => {
        pmic.chargerModule?.get.iTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_current get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerBatLim', () => {
        pmic.chargerModule?.get.batLim?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm_adc fullscale get',
            expect.anything(),
            undefined,
            true,
        );
    });
    test('Request update chargerEnabledRecharging', () => {
        pmic.chargerModule?.get.enabledRecharging();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger module recharge get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerEnableVBatLow', () => {
        pmic.chargerModule?.get.enabledVBatLow();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'powerup_charger vbatlow get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerNTCThermistor', () => {
        pmic.chargerModule?.get.nTCThermistor?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc type get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerNTCBeta', () => {
        pmic.chargerModule?.get.nTCBeta?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx adc ntc beta get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTChgResume', () => {
        pmic.chargerModule?.get.tChgResume();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp resume get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTChgStop', () => {
        pmic.chargerModule?.get.tChgStop?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger die_temp stop get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTCold', () => {
        pmic.chargerModule?.get.tCold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature cold get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTCool', () => {
        pmic.chargerModule?.get.tCool();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature cool get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTWarm', () => {
        pmic.chargerModule?.get.tWarm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature warm get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTHot', () => {
        pmic.chargerModule?.get.tHot();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger ntc_temperature hot get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerVTermR', () => {
        pmic.chargerModule?.get.vTermR?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npmx charger termination_voltage warm get',
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
