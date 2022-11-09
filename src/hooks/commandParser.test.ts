/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Modem } from '../features/modem/modem';
import { hookModemToShellParser } from './commandParser';

// NOTE: hookModemToShellParser depends internaly on ansi.ts. If ansi.tests.ts fail expect errors here
// Consider improving tests and decopiling them from createAnsiDataProcessor by mocking that module

jest.mock('../features/modem/modem');

describe('shell command parser', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockOnResponse = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (data: Buffer[], error?: string) => void) => () => {}
    );
    const mockOnOpen = jest.fn(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        (_handler: (error?: string) => void) => () => {}
    );
    const mockClose = jest.fn(() => {});
    const mockWrite = jest.fn(() => true);
    const mockIsOpen = jest.fn(() => true);
    const mockGetpath = jest.fn(() => '');

    const mockOnSuccess = jest.fn(() => '');
    const mockOnError = jest.fn(() => '');

    const mock = jest.fn<Modem, []>(() => ({
        onResponse: mockOnResponse,
        onOpen: mockOnOpen,
        close: mockClose,
        write: mockWrite,
        isOpen: mockIsOpen,
        getpath: mockGetpath,
    }));

    test('Verify that enqueued command is sent if modem is open', () => {
        const ansiProsesser = hookModemToShellParser(mock());
        ansiProsesser.enqueueRequest(
            'Test Command',
            () => {},
            () => {}
        );

        expect(mockWrite).toBeCalledTimes(1);
        expect(mockWrite).toBeCalledWith('Test Command\r\n');
    });

    test('Verify that enqueued not sent if modem is closed', () => {
        mockIsOpen.mockReturnValue(false);

        const ansiProsesser = hookModemToShellParser(mock());
        ansiProsesser.enqueueRequest(
            'Test Command',
            () => {},
            () => {}
        );

        expect(mockWrite).toBeCalledTimes(0);
    });

    test('Verify that enqueued command is sent on modem opened', () => {
        mockIsOpen.mockReturnValue(false);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onOpenCallback = (_error?: string) => {};

        mockOnOpen.mockImplementation((handler: (error?: string) => void) => {
            onOpenCallback = handler;
            return () => {};
        });

        const ansiProsesser = hookModemToShellParser(mock());
        ansiProsesser.enqueueRequest(
            'Test Command',
            () => {},
            () => {}
        );

        expect(mockWrite).toBeCalledTimes(0);
        mockIsOpen.mockReturnValue(true);

        onOpenCallback();
        expect(mockWrite).toBeCalledTimes(1);
        expect(mockWrite).toBeCalledWith('Test Command\r\n');
    });

    test('Verify onSuccess callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify onSuccess callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('Test Com')]);

        onResponseCallback([Buffer.from('mand\r\nResponse Val')]);

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('ue\r\nuart:~$')]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify onFail callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Wrong Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('Wrong Command\r\nResponse Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
    });

    test('Verify onFail callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('Wrong Command\r\nRe')]);

        onResponseCallback([Buffer.from('sponse Value\r\nuart')]);

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from(':~$')]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('Wrong Command\r\nResponse Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
    });

    test('Verify that only one command is send at a time untill we get a response', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command 1',
            mockOnSuccess,
            mockOnError
        );

        ansiProsesser.enqueueRequest(
            'Test Command 2',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command 1\r\nResponse Value 1\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value 1');

        onResponseCallback([
            Buffer.from('Test Command 2\r\nResponse Value 2\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith('Response Value 2');

        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify on succsess is called for the appropriate responces', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        const mockOnSuccess1 = jest.fn(() => '');
        const mockOnSuccess2 = jest.fn(() => '');

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command 1',
            mockOnSuccess1,
            mockOnError
        );

        ansiProsesser.enqueueRequest(
            'Test Command 2',
            mockOnSuccess2,
            mockOnError
        );

        expect(mockOnSuccess1).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from(
                'Test Command 1\r\nResponse Value 1\r\nuart:~$Test Command 2\r\nResponse Value 2\r\nuart:~$'
            ),
        ]);

        expect(mockOnSuccess1).toBeCalledTimes(1);
        expect(mockOnSuccess1).toBeCalledWith('Response Value 1');

        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess2).toBeCalledWith('Response Value 2');

        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify on error and succsess is called for the appropriate responces', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(mock(), 'uart:~$');
        ansiProsesser.enqueueRequest(
            'Test Command 1',
            mockOnSuccess,
            mockOnError
        );

        ansiProsesser.enqueueRequest(
            'Test Command 2',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from(
                'Wrong Command 1\r\nResponse Value 1\r\nuart:~$Test Command 2\r\nResponse Value 2\r\nuart:~$'
            ),
        ]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith(
            'Wrong Command 1\r\nResponse Value 1'
        );

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value 2');
    });
});

export {};
