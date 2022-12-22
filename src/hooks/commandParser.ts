/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
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

type CommandEnqueue = {
    command: string;
    callbacks: ICallbacks;
};

export type ShellParser = Awaited<ReturnType<typeof hookModemToShellParser>>;
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

export const hookModemToShellParser = async (
    modem: Modem,
    xTerminalShellParser: XTerminalShellParser,
    settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$ ',
        logRegex: '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <inf>',
        errorRegex: 'error: ',
    }
) => {
    const eventEmitter = new EventEmitter();

    let commandBuffer = '';
    let commandQueueCallbacks = new Map<string, ICallbacks[]>();
    let commandQueue: CommandEnqueue[] = [];
    let dataSendingStarted = false;
    let cr = false;
    let crnl = false;
    let oldPausedState = false;

    // init shell mode

    if (await modem.isOpen()) {
        modem.write(String.fromCharCode(12));
    }

    const reset = () => {
        commandBuffer = '';
        commandQueueCallbacks = new Map();
        commandQueue = [];
        dataSendingStarted = false;
        xTerminalShellParser.clear();
        cr = false;
        crnl = false;
    };

    const initDataSend = async () => {
        if (!(await modem.isOpen())) return;
        if (isPaused()) return; // user is typing

        if (dataSendingStarted) return;

        if (commandQueue.length > 0) {
            modem.write(`${commandQueue[0].command}\r\n`);
            dataSendingStarted = true;
        }
    };

    const parseShellCommands = (data: string, endToken: string) => {
        // Buffer does not have the end token hence we have to consider the response
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

    const responseCallback = (response: string) => {
        let callbackFound = false;

        response = response.trim();

        // Trigger one time callbacks
        if (
            commandQueue.length > 0 &&
            response.match(`^${commandQueue[0].command}`)
        ) {
            const command = commandQueue[0].command;
            const commandResponse = response.replace(command, '').trim();
            if (commandResponse.match(settings.errorRegex)) {
                commandQueue[0].callbacks.onError(commandResponse);
                callbackFound = true;
            } else {
                commandQueue[0].callbacks.onSuccess(commandResponse);
                callbackFound = true;
            }

            commandQueue.shift();

            modem.isOpen().then(isOpen => {
                if (isOpen && commandQueue.length > 0 && !isPaused()) {
                    modem.write(`${commandQueue[0].command}\r\n`);
                } else {
                    dataSendingStarted = false;
                }
            });
        }

        // Trigger permanent time callbacks
        commandQueueCallbacks.forEach((callbacks, key) => {
            if (response.match(`^${key}`)) {
                const commandResponse = response.replace(key, '').trim();
                if (commandResponse.match(settings.errorRegex)) {
                    callbacks.forEach(callback => {
                        callback.onError(commandResponse);
                    });
                } else {
                    callbacks.forEach(callback => {
                        callback.onSuccess(commandResponse);
                    });
                }

                callbackFound = true;
            }
        });

        if (response.match(settings.logRegex)) {
            eventEmitter.emit('shellLogging', response);
        } else if (!callbackFound) {
            eventEmitter.emit('unknownCommand', response);
        }
    };

    const loadToBuffer = (newline: boolean) => {
        commandBuffer = `${commandBuffer}${xTerminalShellParser.getTerminalData()}${
            newline ? '\r\n' : ''
        }`;
        xTerminalShellParser.clear();
    };

    const processBuffer = () => {
        if (isPaused()) {
            return;
        }

        loadToBuffer(false);

        commandBuffer = parseShellCommands(
            commandBuffer,
            settings.shellPromptUart
        );
        xTerminalShellParser.clear();
    };

    const unregisterOnOpen = modem.onOpen(async () => {
        modem.write(String.fromCharCode(12));
        await initDataSend();
    });

    // Hook to listen to all modem data
    const unregisterOnResponse = modem.onResponse(async data => {
        data.forEach(byte => {
            cr = byte === 13 || (cr && byte === 10);
            crnl = cr && byte === 10;

            const callback = crnl ? () => loadToBuffer(true) : processBuffer;

            xTerminalShellParser.write(String.fromCharCode(byte), callback);
        });

        await initDataSend();
    });

    const isPaused = () => {
        const newPausedState =
            xTerminalShellParser.getLastLine() !==
            settings.shellPromptUart.trim();

        if (oldPausedState !== newPausedState) {
            oldPausedState = newPausedState;
            // init sending of commands
            eventEmitter.emit('pausedChanged', newPausedState);
        }
        return newPausedState;
    };

    return {
        onPausedChange: (handler: (state: boolean) => void) => {
            eventEmitter.on('pausedChanged', handler);
            return () => eventEmitter.removeListener('pausedChanged', handler);
        },
        onShellLoggingEvent: (handler: (state: string) => void) => {
            eventEmitter.on('shellLogging', handler);
            return () => eventEmitter.removeListener('shellLogging', handler);
        },
        onUnknownCommand: (handler: (state: string) => void) => {
            eventEmitter.on('unknownCommand', handler);
            return () => eventEmitter.removeListener('unknownCommand', handler);
        },
        enqueueRequest: async (
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
            await initDataSend();
        },
        registerCommandCallback: (
            command: string,
            onSuccess: (data: string) => void,
            onError: (error: string) => void
        ) => {
            // Add Callbacks to the queue for future responses
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

                if (cb === undefined) return;

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
