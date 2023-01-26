/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { createSerialPort, Device } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

import {
    setAvailableSerialPorts,
    setSelectedSerialport,
    setSerialPort,
    setShellParser,
} from '../features/serial/serialSlice';
import { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    dispatch(setShellParser(undefined));
    dispatch(setSerialPort(undefined));
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSelectedSerialport(undefined));
};

export const openDevice =
    (device: Device): TAction =>
    async dispatch => {
        // Reset serial port settings
        const ports = device.serialPorts;

        if (ports && ports?.length > 0) {
            dispatch(
                setAvailableSerialPorts(ports.map(port => port.comName ?? ''))
            );
        }

        if (ports) {
            const comPort = ports[0].comName; // We want to connect to vComIndex 0
            if (comPort) {
                dispatch(setSelectedSerialport(comPort));
                await dispatch(
                    setSerialPort(
                        await createSerialPort(
                            {
                                path: comPort,
                                baudRate: 115200,
                            } as SerialPortOpenOptions<AutoDetectTypes>,
                            { overwrite: true, settingsLocked: true }
                        )
                    )
                );
            }
        }
    };

export const deviceConnected = (): TAction => () => {};

export const deviceDisconnected = (): TAction => () => {};
