/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Terminal } from 'xterm-headless';

import { Modem } from '../features/modem/modem';

interface ICallbacks {
    onSuccess: (data: string) => void;
    onError: (data: string) => void;
}

export type ShellParserSettings = {
    shellPromptUart: string;
    logRegex: string;
    errorRegex: string;
};

type CommandEnque = {
    command: string;
    callbacks: ICallbacks;
};

export type ShellParser = ReturnType<typeof hookModemToShellParser>;
export type XTerminalShellParser = ReturnType<
    typeof xTerminalShellParserWrapper
>;

export const xTerminalShellParserWrapper = (terminal: Terminal) => ({
    getTerminalData: () => {
        let out = '';
        for (let i = 0; i <= terminal.buffer.active.cursorY; i += 1) {
            const line = terminal.buffer.active.getLine(i);
            if (typeof line !== 'undefined') {
                out += `\r\n${line.translateToString()}`;
            }
        }

        return out.trim();
    },
    clear: () => terminal.clear(),
    getLastLine: () => {
        const lastLine = terminal.buffer.active.getLine(
            terminal.buffer.active.cursorY
        );
        if (typeof lastLine === 'undefined') {
            return '';
        }

        return lastLine.translateToString().trim();
    },
    write: (data: string, callback: () => void | undefined) =>
        terminal.write(data, callback),
});

export const hookModemToShellParser = (
    modem: Modem,
    xTerminalShellParser: XTerminalShellParser,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shellLoggingCallback = (_log: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unknowCommandCallback = (data: string) => {},
    settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$ ',
        logRegex: '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <inf>',
        errorRegex: 'error: ',
    }
) => {
    let commandBuffer = '';
    let commandQueueCallbacks = new Map<string, ICallbacks[]>();
    let commandQueue: CommandEnque[] = [];
    let dataSendingStarted = false;
    let cr = false;
    let crnl = false;

    const reset = () => {
        commandBuffer = '';
        commandQueueCallbacks = new Map();
        commandQueue = [];
        dataSendingStarted = false;
        xTerminalShellParser.clear();
        cr = false;
        crnl = false;
    };

    const initDataSend = () => {
        if (isPaused()) return; // user is typing

        if (dataSendingStarted) return;

        if (commandQueue.length > 0 && modem.isOpen()) {
            modem.write(`${commandQueue[0].command}\r\n`);
            dataSendingStarted = true;
        }
    };

    const parseShellCommands = (data: string, endToken: string) => {
        // Buffer does not have the end token hence we have to consider the responce
        // to still have pending bytes hence we need to wait more.
        if (data.indexOf(endToken.trim()) !== -1) {
            const commands = data.split(endToken.trim());
            commands.forEach((command, index) => {
                if (index === commands.length - 1) return;

                const cleanCommand = command.trim();

                if (cleanCommand.length === 0) return;

                responseCallback(cleanCommand);
            });

            // Incomplete command leave it for future processing
            const remainingCommandPart = commands.pop();
            if (remainingCommandPart && remainingCommandPart.length > 0) {
                return remainingCommandPart;
            }

            return '';
        }

        return data;
    };

    const responseCallback = (responce: string) => {
        let callbackFound = false;

        responce = responce.trim();

        // Trigger one time callbacks
        if (
            commandQueue.length > 0 &&
            responce.match(`^${commandQueue[0].command}`)
        ) {
            const command = commandQueue[0].command;
            const commandResponce = responce.replace(command, '').trim();
            if (commandResponce.match(settings.errorRegex)) {
                commandQueue[0].callbacks.onError(commandResponce);
                callbackFound = true;
            } else {
                commandQueue[0].callbacks.onSuccess(commandResponce);
                callbackFound = true;
            }

            commandQueue.shift();

            if (commandQueue.length > 0 && modem.isOpen() && !isPaused()) {
                modem.write(`${commandQueue[0].command}\r\n`);
            } else {
                dataSendingStarted = false;
            }
        }

        // Trigger permanent time callbacks
        commandQueueCallbacks.forEach((callbacks, key) => {
            if (responce.match(`^${key}`)) {
                const commandResponce = responce.replace(key, '').trim();
                if (commandResponce.match(settings.errorRegex)) {
                    callbacks.forEach(callback => {
                        callback.onError(commandResponce);
                    });
                } else {
                    callbacks.forEach(callback => {
                        callback.onSuccess(commandResponce);
                    });
                }

                callbackFound = true;
            }
        });

        if (responce.match(settings.logRegex)) {
            shellLoggingCallback(responce);
        } else if (!callbackFound) {
            unknowCommandCallback(responce);
        }
    };

    const loadToBuffer = (newline: boolean) => {
        commandBuffer = `${commandBuffer}${xTerminalShellParser.getTerminalData()}${
            newline ? '\r\n' : ''
        }`;
        xTerminalShellParser.clear();
    };

    const processBuffer = () => {
        if (
            xTerminalShellParser.getLastLine() !==
            settings.shellPromptUart.trim()
        ) {
            return;
        }

        loadToBuffer(false);

        commandBuffer = parseShellCommands(
            commandBuffer,
            settings.shellPromptUart
        );
        xTerminalShellParser.clear();
    };

    const unregisterOnOpen = modem.onOpen(() => initDataSend());

    // Hook to listen to all modem data
    const unregisterOnResponse = modem.onResponse(data =>
        data.forEach(dd => {
            dd.forEach(byte => {
                cr = byte === 13 || (cr && byte === 10);
                crnl = cr && byte === 10;

                const callback = crnl
                    ? () => loadToBuffer(true)
                    : processBuffer;

                xTerminalShellParser.write(String.fromCharCode(byte), callback);
            });
        })
    );

    const isPaused = () =>
        xTerminalShellParser.getLastLine() !== settings.shellPromptUart.trim();

    return {
        enqueueRequest: (
            command: string,
            onSuccess: (data: string) => void = () => {},
            onError: (error: string) => void = () => {}
        ) => {
            commandQueue.push({
                command,
                callbacks: {
                    onSuccess,
                    onError,
                },
            });

            // init sending of commands
            initDataSend();
        },
        registerCommandCallback: (
            command: string,
            onSuccess: (data: string) => void,
            onError: (error: string) => void
        ) => {
            // Add Callbacks to the queue for future responces
            const callbacks = { onSuccess, onError };
            const existingCallbacks = commandQueueCallbacks.get(command);
            if (typeof existingCallbacks !== 'undefined') {
                commandQueueCallbacks.set(command, [
                    ...existingCallbacks,
                    callbacks,
                ]);
            } else {
                commandQueueCallbacks.set(command, [{ onSuccess, onError }]);
            }

            return () => {
                const cb = commandQueueCallbacks.get(command);

                if (typeof cb === 'undefined') return;

                if (cb.length === 1) {
                    commandQueueCallbacks.delete(command);
                    return;
                }

                cb.splice(cb.indexOf(callbacks), 1);
                commandQueueCallbacks.set(command, cb);
            };
        },
        unregister: () => {
            unregisterOnOpen();
            unregisterOnResponse();
            reset();
        },
        isPaused,
    };
};
