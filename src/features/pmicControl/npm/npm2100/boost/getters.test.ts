/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { setupMocksWithShellParser } from '../tests/helpers';

describe('PMIC 2100 - Request update Boost commands', () => {
    const { mockEnqueueRequest, pmic } = setupMocksWithShellParser();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('npm2100 boost get all', () => {
        pmic.boostModule[0].get.all();

        expect(mockEnqueueRequest).toBeCalledTimes(7);
        expect(mockEnqueueRequest).nthCalledWith(
            1,
            `npm2100 boost vout VSET get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            2,
            `npm2100 boost vout SOFTWARE get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            3,
            `npm2100 boost voutsel get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            4,
            `npm2100 boost mode get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            5,
            `npm2100 boost pinsel get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            6,
            `npm2100 boost pinmode get`,
            expect.anything(),
            undefined,
            true
        );
        expect(mockEnqueueRequest).nthCalledWith(
            7,
            `npm2100 boost ocp get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost vout VSET get', () => {
        pmic.boostModule[0].get.vOutVSet();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost vout VSET get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost vout SOFTWARE get', () => {
        pmic.boostModule[0].get.vOutSoftware();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost vout SOFTWARE get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost vOutSel get', () => {
        pmic.boostModule[0].get.vOutSel();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost voutsel get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost modeControl get', () => {
        pmic.boostModule[0].get.modeControl();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost mode get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost pinsel get', () => {
        pmic.boostModule[0].get.pinSelection();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost pinsel get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost pinmode get', () => {
        pmic.boostModule[0].get.pinMode();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost pinmode get`,
            expect.anything(),
            undefined,
            true
        );
    });

    test('npm2100 boost ocp get', () => {
        pmic.boostModule[0].get.overCurrent();

        expect(mockEnqueueRequest).toBeCalledTimes(1);
        expect(mockEnqueueRequest).toBeCalledWith(
            `npm2100 boost ocp get`,
            expect.anything(),
            undefined,
            true
        );
    });
});

export {};
