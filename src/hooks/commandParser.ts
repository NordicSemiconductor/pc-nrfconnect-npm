/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
import { SerialPort } from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

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
    sent: boolean;
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
    serialPort: SerialPort,
    xTerminalShellParser: XTerminalShellParser,
    settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$ ',
        logRegex:
            '^[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): ',
        errorRegex: 'Error ',
    }
) => {
    const eventEmitter = new EventEmitter();

    let commandBuffer = '';
    let commandQueueCallbacks = new Map<string, ICallbacks[]>();
    let commandQueue: CommandEnqueue[] = [];
    let dataSendingStarted = false;
    let cr = false;
    let crnl = false;
    let pausedState = true; // Assume we have some command in the shell that has user has started typing

    // init shell mode

    if (await serialPort.isOpen()) {
        serialPort.write(
            `${String.fromCharCode(12).toString()}${String.fromCharCode(
                21
            ).toString()}`
        );
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
        if (!(await serialPort.isOpen())) return;
        if (pausedState) return; // user is typing

        if (dataSendingStarted) return;

        if (commandQueue.length > 0) {
            sendCommands();
        }
    };

    const sendCommands = () => {
        commandQueue.forEach(c => {
            if (!c.sent) {
                serialPort.write(`${c.command}\r\n`);
                c.sent = true;
            }
        });
        dataSendingStarted = true;
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

            serialPort.isOpen().then(isOpen => {
                if (isOpen && commandQueue.length > 0 && !pausedState) {
                    sendCommands();
                } else {
                    dataSendingStarted = false;
                }
            });
        }

        // Trigger permanent time callbacks
        commandQueueCallbacks.forEach((callbacks, key) => {
            if (response.match(`^(${key})`)) {
                const commandResponse = response
                    .replace(new RegExp(`^(${key})\r\n`), '')
                    .trim();
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
        if (!canProcess()) {
            return;
        }

        loadToBuffer(false);

        commandBuffer = parseShellCommands(
            commandBuffer,
            settings.shellPromptUart
        );
        xTerminalShellParser.clear();
    };

    // Hook to listen to all modem data
    const unregisterOnResponse = serialPort.onData(async data => {
        data.forEach(byte => {
            cr = byte === 13 || (cr && byte === 10);
            crnl = cr && byte === 10;

            const callback = crnl ? () => loadToBuffer(true) : processBuffer;

            xTerminalShellParser.write(String.fromCharCode(byte), callback);
        });

        updateIsPaused();
        await initDataSend();
    });

    const unregisterOnDataWritten = serialPort.onDataWritten(() => {
        if (!pausedState) {
            eventEmitter.emit('pausedChanged', true);
        }
        pausedState = true;
        updateIsPaused();
    });

    const canProcess = () =>
        xTerminalShellParser.getLastLine() === settings.shellPromptUart.trim();

    let t: NodeJS.Timeout;
    const updateIsPaused = () => {
        clearTimeout(t);
        // if we have uart string we can technically update the the shell as not paused, but this might not be true us device has some
        // partial command in its buffer hance we delay some time to make use we have uart string only for some time ensuring unpaused state.
        t = setTimeout(() => {
            if (pausedState === canProcess()) {
                pausedState = !canProcess();
                eventEmitter.emit('pausedChanged', pausedState);
            }
        }, 5);
    };

    return {
        onPausedChange: (handler: (state: boolean) => void) => {
            eventEmitter.on('pausedChanged', handler);
            handler(pausedState);
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
            onError: (error: string) => void = () => {},
            unique = false
        ) => {
            if (unique) {
                if (
                    commandQueue?.findIndex(
                        item => item.command === command
                    ) !== -1
                )
                    return;
            }

            commandQueue.push({
                command,
                callbacks: {
                    onSuccess,
                    onError,
                },
                sent: false,
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
            unregisterOnResponse();
            unregisterOnDataWritten();
            reset();
        },
        isPaused: () => pausedState,
        unPause: () => serialPort.write(String.fromCharCode(21)),
    };
};
