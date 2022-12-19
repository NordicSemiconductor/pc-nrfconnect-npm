/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import EventEmitter from 'events';
import { logger, SerialPort } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

export type Modem = Awaited<ReturnType<typeof createModem>>;

export const createModem = async (serialPortPath: string) => {
    const eventEmitter = new EventEmitter();

    const serialPort = await SerialPort(
        {
            path: serialPortPath,
            baudRate: 115200,
        } as SerialPortOpenOptions<AutoDetectTypes>,
        { overwrite: true, settingsLocked: true },
        {
            onData: data => eventEmitter.emit('response', [data]),
            onUpdate: opt =>
                console.warn(
                    `Received onUpdate from serial port: ${JSON.stringify(opt)}`
                ),
            onSet: opt =>
                console.warn(
                    `Received onSet from serial port: ${JSON.stringify(opt)}`
                ),
            onChange: opt => {
                console.warn(
                    `Received new settings from serial port: ${JSON.stringify(
                        opt
                    )}`
                );
            },
            onDataWritten: () => {},
        }
    );

    return {
        onResponse: (handler: (data: Buffer[], error?: string) => void) => {
            eventEmitter.on('response', handler);
            return () => {
                eventEmitter.removeListener('response', handler);
            };
        },

        onOpen: (handler: (error?: string) => void) => {
            eventEmitter.on('open', handler);
            return () => {
                eventEmitter.removeListener('open', handler);
            };
        },

        close: async () => {
            if (await serialPort.isOpen()) {
                logger.info(`Closing: '${serialPort.path}'`);
                return serialPort.close();
            }
        },

        write: (command: string) => {
            serialPort.write(command);
            return true;
        },

        update: (newOptions: UpdateOptions): void =>
            serialPort.update(newOptions),

        set: (newOptions: SetOptions): void => serialPort.set(newOptions),

        isOpen: (): Promise<boolean> => serialPort.isOpen(),

        getPath: (): string => serialPort.path,
    };
};
