/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Modem } from '../features/modem/modem';
import { createAnsiDataProcessor } from './ansi';

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

export const hookModemToShellParser = (
    modem: Modem,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    shellLoggingCallback = (_log: string) => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    unknowCommandCallback = (data: string) => {},
    settings: ShellParserSettings = {
        shellPromptUart: 'uart:~$ ',
        logRegex: '<inf> ',
        errorRegex: 'error: ',
    }
) => {
    let commandBuffer = Buffer.from([]);
    let commandQueueCallbacks = new Map<string, ICallbacks[]>();
    let commandQueue: CommandEnque[] = [];
    let dataSendingStarted = false;

    const reset = () => {
        commandBuffer = Buffer.from([]);
        commandQueueCallbacks = new Map();
        commandQueue = [];
        dataSendingStarted = false;
    };

    const initDataSend = () => {
        if (dataSendingStarted) return;

        if (commandQueue.length > 0 && modem.isOpen()) {
            modem.write(`${commandQueue[0].command}\r\n`);
            dataSendingStarted = true;
        }
    };

    const unregisterOnOpen = modem.onOpen(() => initDataSend());

    const parseShellCommands = (
        data: Buffer,
        endToken: string,
        callback: (data: string) => void
    ) => {
        const tmp = new Uint8Array(commandBuffer.byteLength + data.byteLength);
        tmp.set(new Uint8Array(commandBuffer), 0);
        tmp.set(new Uint8Array(data), commandBuffer.byteLength);

        commandBuffer = Buffer.from(tmp);

        const commandsString = commandBuffer.toString();

        // Buffer does not have the end token hence we have to consider the responce
        // to still have pending bytes hence we need to wait more.
        if (commandsString.indexOf(endToken) !== -1) {
            const commands = commandsString.split(endToken);
            commands.forEach(command => {
                const cleanCommand = command.trim();
                if (cleanCommand.length === 0) return;
                callback(cleanCommand);
            });

            // Incomplete command leave it for future processing
            const remainingCommandPart = commands.pop();
            if (remainingCommandPart && remainingCommandPart.length > 0) {
                commandBuffer = Buffer.from(remainingCommandPart);
            } else {
                commandBuffer = Buffer.from([]);
            }
        } else {
            commandBuffer = Buffer.from(commandsString);
        }
    };

    const responseCallback = (responce: string) => {
        let callbackFound = false;

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

            if (commandQueue.length > 0 && modem.isOpen()) {
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

    const ansiProcessor = createAnsiDataProcessor();

    // Hook to listen to all modem data
    const unregisterOnResponse = modem.onResponse(data =>
        data.forEach(dd =>
            ansiProcessor.processAnsiData(
                dd,
                () => {}, // TODO Pop from buffer if ANSI Command to do backspace?
                d =>
                    parseShellCommands(
                        d,
                        settings.shellPromptUart,
                        responseCallback
                    )
            )
        )
    );

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
            const existingCallbacks = commandQueueCallbacks.get(command);
            if (typeof existingCallbacks !== 'undefined') {
                commandQueueCallbacks.set(command, [
                    ...existingCallbacks,
                    { onSuccess, onError },
                ]);
            } else {
                commandQueueCallbacks.set(command, [{ onSuccess, onError }]);
            }

            // return unregister callback?
        },
        unregister: () => {
            unregisterOnOpen();
            unregisterOnResponse();
            reset();
        },
    };
};
