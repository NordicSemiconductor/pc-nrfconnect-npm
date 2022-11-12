/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Modem } from '../features/modem/modem';
import {
    hookModemToShellParser,
    ShellParserSettings,
    XTerminalShellParser,
} from './commandParser';

jest.mock('../features/modem/modem');

describe('shell command parser', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        termnalBuffer = settings.shellPromptUart;
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

    const mockOnShellLogging = jest.fn(() => '');
    const mockOnUnknown = jest.fn(() => '');

    const mockOnSuccess = jest.fn(() => '');
    const mockOnError = jest.fn(() => '');

    const settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$',
        logRegex: '<inf> ',
        errorRegex: 'error: ',
    };

    const mockModem = jest.fn<Modem, []>(() => ({
        onResponse: mockOnResponse,
        onOpen: mockOnOpen,
        close: mockClose,
        write: mockWrite,
        isOpen: mockIsOpen,
        getpath: mockGetpath,
    }));

    let termnalBuffer = '';

    const mockGetTerminalData = jest.fn(() => termnalBuffer);
    const mockClear = jest.fn(() => {
        termnalBuffer = '';
    });
    const mockGetLastLine = jest.fn(
        () => termnalBuffer.split('\r\n').pop() as string
    );
    const mockTerminalWrite = jest.fn(
        (data: string, callback: () => void | undefined) => {
            termnalBuffer += data;
            callback();
        }
    );

    const mockTerminal = jest.fn<XTerminalShellParser, []>(() => ({
        getTerminalData: mockGetTerminalData,
        clear: mockClear,
        getLastLine: mockGetLastLine,
        write: mockTerminalWrite,
    }));

    test('Verify that no callback is called untill we get a responce', () => {
        mockIsOpen.mockReturnValueOnce(false);

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal()
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockClose).toBeCalledTimes(0);
        expect(mockWrite).toBeCalledTimes(0);

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify that enqueued command is sent if modem is open', () => {
        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal()
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockWrite).toBeCalledTimes(1);
        expect(mockWrite).toBeCalledWith('Test Command\r\n');
    });

    test('Verify that enqueued not sent if modem is closed', () => {
        mockIsOpen.mockReturnValueOnce(false);

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal()
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockWrite).toBeCalledTimes(0);
    });

    test('Verify that enqueued command is sent on modem opened', () => {
        mockIsOpen.mockReturnValueOnce(false);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onOpenCallback = (_error?: string) => {};

        mockOnOpen.mockImplementation((handler: (error?: string) => void) => {
            onOpenCallback = handler;
            return () => {};
        });

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal()
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockWrite).toBeCalledTimes(0);
        mockIsOpen.mockReturnValueOnce(true);

        onOpenCallback();
        expect(mockWrite).toBeCalledTimes(1);
        expect(mockWrite).toBeCalledWith('Test Command\r\n');
    });

    test('Verify one time onSuccess callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
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

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify one time onSuccess callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
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

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$'),
        ]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('Test Command\r\nerror: Re')]);

        onResponseCallback([Buffer.from('sponse Value\r\nuart')]);

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from(':~$')]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
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

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
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
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify that onSuccess is called for the appropriate responces', () => {
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

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
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
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onError and onSuccess is called for the appropriate responces', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
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
                'Test Command 1\r\nerror: Response Value 1\r\nuart:~$Test Command 2\r\nResponse Value 2\r\nuart:~$'
            ),
        ]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('error: Response Value 1');

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value 2');

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify perminent onSuccess callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        ansiProsesser.enqueueRequest('Test Command');

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify perminent onSuccess callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('Test Com')]);

        onResponseCallback([Buffer.from('mand\r\nResponse Val')]);

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('ue\r\nuart:~$')]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify perminent onFail callback is called when we have a response in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$'),
        ]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$'),
        ]);

        expect(mockOnError).toBeCalledTimes(2);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify one time onFail callback is called when we have a response in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        ansiProsesser.enqueueRequest('Test Command');

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('Test Command\r\nerror: Re')]);

        onResponseCallback([Buffer.from('sponse Value\r\nuart')]);

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([Buffer.from(':~$')]);

        expect(mockOnError).toBeCalledTimes(1);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify perminent and one time onSuccess both callback is called when we have a response', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnSuccess).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(2);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
    });

    test('Verify perminent and one time onFail callback is called when we have a response', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );
        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );
        ansiProsesser.enqueueRequest(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        expect(mockOnError).toBeCalledTimes(0);

        onResponseCallback([
            Buffer.from('Test Command\r\nerror: Response Value\r\nuart:~$'),
        ]);

        expect(mockOnError).toBeCalledTimes(2);
        expect(mockOnError).toBeCalledWith('error: Response Value');

        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onShellLogging callback is called when we have a response logging shell in one stream', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        onResponseCallback([
            Buffer.from('<inf> main: v=3.595881,i=0.176776\r\nuart:~$'),
        ]);

        expect(mockOnShellLogging).toBeCalledTimes(1);
        expect(mockOnShellLogging).toBeCalledWith(
            '<inf> main: v=3.595881,i=0.176776'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onShellLogging callback is called when we have a response logging shell in multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        onResponseCallback([Buffer.from('<inf> main: v=3.595881,i=0')]);

        expect(mockOnShellLogging).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('.176776\r\nuart:~$')]);

        expect(mockOnShellLogging).toBeCalledTimes(1);
        expect(mockOnShellLogging).toBeCalledWith(
            '<inf> main: v=3.595881,i=0.176776'
        );

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnUnknown).toBeCalledTimes(0);
    });

    test('Verify onUnknown callback is called when we have a response that is not logging nor is it a registred command one strem', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnUnknown).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledWith('Test Command\r\nResponse Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify onUnknown callback is called when we have a response that is not logging nor is it a registred command multiple streams', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        onResponseCallback([Buffer.from('Test Command\r\nRespons')]);

        expect(mockOnUnknown).toBeCalledTimes(0);

        onResponseCallback([Buffer.from('e Value\r\nuart:~$')]);

        expect(mockOnUnknown).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledWith('Test Command\r\nResponse Value');

        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnSuccess).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify perminent callback unregister removes the callback', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        const unregister = ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess,
            mockOnError
        );

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnSuccess).toBeCalledWith('Response Value');

        unregister();

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess).toBeCalledTimes(1);
        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });

    test('Verify perminent callback unregister removes the right callback', () => {
        const mockOnSuccess1 = jest.fn(() => '');
        const mockOnSuccess2 = jest.fn(() => '');
        const mockOnSuccess3 = jest.fn(() => '');

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let onResponseCallback = (data: Buffer[], _error?: string) => {};

        mockOnResponse.mockImplementation(
            (handler: (data: Buffer[], error?: string) => void) => {
                onResponseCallback = handler;
                return () => {};
            }
        );

        const ansiProsesser = hookModemToShellParser(
            mockModem(),
            mockTerminal(),
            mockOnShellLogging,
            mockOnUnknown,
            settings
        );

        ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess1,
            mockOnError
        );

        const unregister2 = ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess2,
            mockOnError
        );

        const unregister3 = ansiProsesser.registerCommandCallback(
            'Test Command',
            mockOnSuccess3,
            mockOnError
        );

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess1).toBeCalledTimes(1);
        expect(mockOnSuccess1).toBeCalledWith('Response Value');

        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess2).toBeCalledWith('Response Value');

        expect(mockOnSuccess3).toBeCalledTimes(1);
        expect(mockOnSuccess3).toBeCalledWith('Response Value');

        unregister2();

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess1).toBeCalledTimes(2);
        expect(mockOnSuccess1).toBeCalledWith('Response Value');

        expect(mockOnSuccess2).toBeCalledTimes(1);

        expect(mockOnSuccess3).toBeCalledTimes(2);
        expect(mockOnSuccess3).toBeCalledWith('Response Value');

        unregister3();

        ansiProsesser.enqueueRequest('Test Command');

        onResponseCallback([
            Buffer.from('Test Command\r\nResponse Value\r\nuart:~$'),
        ]);

        expect(mockOnSuccess1).toBeCalledTimes(3);
        expect(mockOnSuccess1).toBeCalledWith('Response Value');
        expect(mockOnSuccess2).toBeCalledTimes(1);
        expect(mockOnSuccess3).toBeCalledTimes(2);

        expect(mockOnUnknown).toBeCalledTimes(0);
        expect(mockOnError).toBeCalledTimes(0);
        expect(mockOnShellLogging).toBeCalledTimes(0);
    });
});

export {};
