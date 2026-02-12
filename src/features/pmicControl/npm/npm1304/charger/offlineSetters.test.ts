/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1304 - Setters Offline tests', () => {
    const { mockOnChargerUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set setChargerVTerm ', async () => {
        await pmic.chargerModule?.set.vTerm(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 1 });
    });

    test('Set setChargerIChg', async () => {
        await pmic.chargerModule?.set.iChg(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 1 });
    });

    test('Set setChargerVTrickleFast ', async () => {
        await pmic.chargerModule?.set.vTrickleFast(2.5);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTrickleFast: 2.5 });
    });

    test('Set setChargerITerm', async () => {
        await pmic.chargerModule?.set.iTerm(10);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: 10 });
    });

    test('Set setChargerEnabledRecharging ', async () => {
        await pmic.chargerModule?.set.enabledRecharging(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableRecharging: true,
        });
    });

    test('Set setChargerEnabledBatLow ', async () => {
        await pmic.chargerModule?.set.enabledVBatLow(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            enableVBatLow: true,
        });
    });

    test('Set setChargerEnabled', async () => {
        await pmic.chargerModule?.set.enabled(true);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ enabled: true });
    });

    test('Set setChargerTChgResume', async () => {
        await pmic.chargerModule?.set.tChgResume(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgResume: 90 });
    });

    test('Set setChargerTChgStop', async () => {
        await pmic.chargerModule?.set.tChgStop?.(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgStop: 90 });
    });

    test('Set setChargerTCold', async () => {
        await pmic.chargerModule?.set.tCold(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCold: 90 });
    });

    test('Set setChargerTCool', async () => {
        await pmic.chargerModule?.set.tCool(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCool: 90 });
    });

    test('Set setChargerTWarm', async () => {
        await pmic.chargerModule?.set.tWarm(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tWarm: 90 });
    });

    test('Set setChargerTHot', async () => {
        await pmic.chargerModule?.set.tHot(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tHot: 90 });
    });

    test('Set setChargerVTermR', async () => {
        await pmic.chargerModule?.set.vTermR?.(3.55);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTermR: 3.55 });
    });

    test('Set setChargerNTCBeta', async () => {
        await pmic.chargerModule?.set.nTCBeta?.(3380);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcBeta: 3380,
        });
    });

    test('Set setChargerNTCThermistor', async () => {
        await pmic.chargerModule?.set.nTCThermistor?.('100 kΩ');

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({
            ntcThermistor: '100 kΩ',
        });
    });
});

export {};
