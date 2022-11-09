/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Modem } from '../features/modem/modem';
import { createAnsiDataProcessor } from './ansi';

export type ShellParser = ReturnType<typeof hookModemToShellParser>;

export const hookModemToShellParser = (
    modem: Modem,
    terminator = 'uart:~$'
) => {
    let commandBuffer = Buffer.from([]);
    let commandQueueCallbacks = new Map();
    let commandQueue: string[] = [];
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
            modem.write(`${commandQueue[0]}\r\n`);
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
        if (commandQueue.length === 0) return;

        const currentRequest = commandQueue.shift();
        const currentCallbacks = commandQueueCallbacks.get(currentRequest);

        const currentCallback = currentCallbacks.shift();

        if (currentCallbacks.length === 0) {
            commandQueueCallbacks.delete(currentRequest);
        } else {
            commandQueueCallbacks.set(currentRequest, currentCallbacks);
        }

        if (responce.startsWith(`${currentRequest}\r\n`)) {
            currentCallback.onSuccess(
                responce.replace(`${currentRequest}\r\n`, '') // First instance only?
            );
        } else {
            currentCallback.onError(responce);
        }

        if (commandQueue.length > 0 && modem.isOpen()) {
            modem.write(`${commandQueue[0]}\r\n`);
        } else {
            dataSendingStarted = false;
        }
    };

    const ansiProcessor = createAnsiDataProcessor();

    // Hook to listen to all modem data
    const unregister = modem.onResponse(data =>
        data.forEach(dd =>
            ansiProcessor.processAnsiData(
                dd,
                () => {}, // TODO Pop from buffer if ANSI Command to do backspace?
                d => parseShellCommands(d, terminator, responseCallback)
            )
        )
    );

    return {
        enqueueRequest: (
            request: string,
            onSuccess: (data: string) => void,
            onError: (error: string) => void
        ) => {
            // Add Callbacks to the queue for future responces
            const existingCallbacks = commandQueueCallbacks.get(request);
            if (typeof existingCallbacks !== 'undefined') {
                commandQueueCallbacks.set(request, [
                    ...existingCallbacks,
                    { onSuccess, onError },
                ]);
            } else {
                commandQueueCallbacks.set(request, [{ onSuccess, onError }]);
            }
            commandQueue.push(request);

            // init sending of commands
            initDataSend();
        },
        unregister: () => {
            unregisterOnOpen();
            unregister();
            reset();
        },
    };
};
