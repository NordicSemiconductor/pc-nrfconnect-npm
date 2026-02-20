/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksBase } from '../tests/helpers';

// UI should get update events immediately and not wait for feedback from shell responses when offline as there is no shell
describe('PMIC 1012 - Setters Offline tests', () => {
    const { mockOnChargerUpdate, pmic } = setupMocksBase();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Set setChargerVTerm ', async () => {
        await pmic.chargerModule?.set.vTerm(4.25);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).nthCalledWith(1, { vTerm: 4.25 });
    });

    test('Set setChargerIChg', async () => {
        await pmic.chargerModule?.set.iChg(1.5);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iChg: 1.5 });
    });

    test('Set setChargerVTrickleFast ', async () => {
        await pmic.chargerModule?.set.vTrickleFast(2.5);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTrickleFast: 2.5 });
    });

    test('Set setChargerITerm', async () => {
        await pmic.chargerModule?.set.iTerm(3.125);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ iTerm: 3.125 });
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

    test('Set setChargerTChgReduce', async () => {
        await pmic.chargerModule?.set.tChgReduce?.(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgReduce: 90 });
    });

    test('Set setChargerTChgResume', async () => {
        await pmic.chargerModule?.set.tChgResume(90);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tChgResume: 90 });
    });

    test('Set setChargerTCold', async () => {
        await pmic.chargerModule?.set.tCold(-20);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ tCold: -20 });
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

    test('Set setChargerVTermCool', async () => {
        await pmic.chargerModule?.set.vTermCool?.(3.55);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTermCool: 3.55 });
    });

    test('Set setChargerVTermWarm', async () => {
        await pmic.chargerModule?.set.vTermWarm?.(3.55);

        expect(mockOnChargerUpdate).toBeCalledTimes(1);
        expect(mockOnChargerUpdate).toBeCalledWith({ vTermWarm: 3.55 });
    });
});

export {};
