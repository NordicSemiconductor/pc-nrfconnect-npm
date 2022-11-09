/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createAnsiDataProcessor } from './ansi';

describe('ansiFilter', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockAnsiCallback = jest.fn(() => {});
    const mockTextCallback = jest.fn(() => {});

    it('incomplete ansi stream', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from([27, 91, 72]),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).toBeCalledTimes(0);
        expect(mockTextCallback).toBeCalledTimes(0);
    });
    it('complete ansi in one stream', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from([27, 91, 49, 59, 51, 50, 109]),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).nthCalledWith(
            1,
            Buffer.from([27, 91, 49, 59, 51, 50, 109])
        );
        expect(mockAnsiCallback).toBeCalledTimes(1);
        expect(mockTextCallback).toBeCalledTimes(0);
    });
    it('complete ansi in two stream', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from([27, 91, 49]),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).toBeCalledTimes(0);

        ansiProsesser.processAnsiData(
            Buffer.from([59, 51, 50, 109]),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).nthCalledWith(
            1,
            Buffer.from([27, 91, 49, 59, 51, 50, 109])
        );
        expect(mockAnsiCallback).toBeCalledTimes(1);
        expect(mockTextCallback).toBeCalledTimes(0);
    });
    it('complete ansi stream with partial ansi', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from(Buffer.from([27, 91, 50, 74, 27, 91, 49, 59, 51, 50])),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).nthCalledWith(
            1,
            Buffer.from([27, 91, 50, 74])
        );
        expect(mockAnsiCallback).toBeCalledTimes(1);
        expect(mockTextCallback).toBeCalledTimes(0);
    });
    it('two complete ansi streams', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from(
                Buffer.from([27, 91, 50, 74, 27, 91, 49, 59, 51, 50, 109])
            ),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).nthCalledWith(
            1,
            Buffer.from([27, 91, 50, 74])
        );
        expect(mockAnsiCallback).nthCalledWith(
            2,
            Buffer.from([27, 91, 49, 59, 51, 50, 109])
        );
        expect(mockAnsiCallback).toBeCalledTimes(2);

        expect(mockTextCallback).toBeCalledTimes(0);
    });

    it('one complete ansi stream, and text stream', () => {
        const ansiProsesser = createAnsiDataProcessor();
        ansiProsesser.processAnsiData(
            Buffer.from([
                27, 91, 49, 59, 51, 50, 109, 117, 97, 114, 116, 58, 126, 36, 32,
            ]),
            mockAnsiCallback,
            mockTextCallback
        );

        expect(mockAnsiCallback).nthCalledWith(
            1,
            Buffer.from([27, 91, 49, 59, 51, 50, 109])
        );
        expect(mockAnsiCallback).toBeCalledTimes(1);

        expect(mockTextCallback).nthCalledWith(
            1,
            Buffer.from([117, 97, 114, 116, 58, 126, 36, 32])
        );

        expect(mockTextCallback).toBeCalledTimes(1);
    });
});

export {};
