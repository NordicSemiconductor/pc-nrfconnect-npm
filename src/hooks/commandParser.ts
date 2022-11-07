/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Modem } from '../features/modem/modem';
import { processAnsiData } from './ansi';

let commandBuffer = Buffer.from([]);
let commandQueueCallbacks = new Map();
let commandQueue: string[] = [];

export type ShellParser = ReturnType<typeof hookModemToParser>;

export const parseShellCommands = (
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

export const hookModemToParser = (modem: Modem) => {
    const reset = () => {
        commandBuffer = Buffer.from([]);
        commandQueueCallbacks = new Map();
        commandQueue = [];
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

        if (commandQueue.length > 0) {
            modem.write(`${commandQueue[0]}\r\n`);
        }
    };

    // Hook to listen to all modem data
    const unregister = modem.onResponse(data =>
        data.forEach(dd =>
            processAnsiData(
                dd,
                () => {},
                d => {
                    parseShellCommands(d, 'uart:~$', responseCallback);
                }
            )
        )
    );

    modem.write(String.fromCharCode(12));

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
            if (commandQueue.length === 1) {
                modem.write(`${commandQueue[0]}\r\n`);
            }
        },
        unregister: () => {
            unregister();
            reset();
        },
    };
};
