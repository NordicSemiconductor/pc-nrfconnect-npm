/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';
import { logger } from 'pc-nrfconnect-shared';
import SerialPort from 'serialport';

export interface Modem {
    onResponse: (
        handler: (data: Buffer[], error?: string) => void
    ) => () => void;
    onOpen: (handler: (error?: string) => void) => () => void;
    close: (callback?: (error?: Error | null) => void) => void;
    write: (command: string) => boolean;
    isOpen: () => boolean;
    getpath: () => string;
}

export const createModem = (serialPortPath: string): Modem => {
    const eventEmitter = new EventEmitter();

    logger.info(`Opening: '${serialPortPath}'`);

    const serialPort = new SerialPort(
        serialPortPath,
        { baudRate: 115200 },
        e => {
            if (e) {
                logger.error(e);
            }
        }
    );

    serialPort.on('open', () => {
        eventEmitter.emit('open');
    });

    serialPort.on('data', (data: Buffer) => {
        eventEmitter.emit('response', [data]);
    });

    return {
        onResponse: (handler: (data: Buffer[], error?: string) => void) => {
            eventEmitter.on('response', handler);
            return () => eventEmitter.removeListener('response', handler);
        },

        onOpen: (handler: (error?: string) => void) => {
            eventEmitter.on('open', handler);
            return () => eventEmitter.removeListener('open', handler);
        },

        close: (callback?: (error?: Error | null) => void) => {
            if (serialPort.isOpen) {
                logger.info(`Closing: '${serialPort.path}'`);
                serialPort.close(callback);
            }
        },

        write: (command: string) => {
            serialPort.write(command, e => {
                if (e) console.error(e);
            });

            return true;
        },

        isOpen: () => serialPort.isOpen,

        getpath: () => serialPort.path,
    };
};
