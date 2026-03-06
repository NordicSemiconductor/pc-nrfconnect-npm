/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 1012 - Request update commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Request update chargerVTerm', () => {
        pmic.chargerModule?.get.vTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger voltage termination get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerIChg', () => {
        pmic.chargerModule?.get.iChg();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger current charge get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerEnabled', () => {
        pmic.chargerModule?.get.enabled();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger enable get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerVTrickleFast', () => {
        pmic.chargerModule?.get.vTrickleFast();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger voltage trickle get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerITerm', () => {
        pmic.chargerModule?.get.iTerm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger current termination get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerEnabledRecharging', () => {
        pmic.chargerModule?.get.enabledRecharging();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger recharge get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerEnableVBatLow', () => {
        pmic.chargerModule?.get.enabledVBatLow();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger lowbat_charging get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTChgReduce', () => {
        pmic.chargerModule?.get.tChgReduce?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger dietemp reduce get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTChgResume', () => {
        pmic.chargerModule?.get.tChgResume();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger dietemp resume get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTCold', () => {
        pmic.chargerModule?.get.tCold();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger ntc cold get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTCool', () => {
        pmic.chargerModule?.get.tCool();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger ntc cool get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTWarm', () => {
        pmic.chargerModule?.get.tWarm();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger ntc warm get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargerTHot', () => {
        pmic.chargerModule?.get.tHot();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger ntc hot get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargervTermCool', () => {
        pmic.chargerModule?.get.vTermCool?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger voltage termination_cool get',
            expect.anything(),
            undefined,
            true,
        );
    });

    test('Request update chargervTermWarm', () => {
        pmic.chargerModule?.get.vTermWarm?.();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            'npm1012 charger voltage termination_warm get',
            expect.anything(),
            undefined,
            true,
        );
    });
});

export {};
