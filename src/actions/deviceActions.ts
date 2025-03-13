/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AppThunk,
    createSerialPort,
    describeError,
    Device,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';

import { RootState } from '../appReducer';
import { setSerialPort } from '../features/serial/serialSlice';

export const closeDevice =
    (): AppThunk<RootState, Promise<void>> => async (dispatch, getState) => {
        try {
            await getState().app.serial.serialPort?.close();
        } catch (e) {
            console.error(describeError(e));
        }

        dispatch(setSerialPort(undefined));
    };

export const openDevice =
    (device: Device): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        // Reset serial port settings
        const ports = device.serialPorts;

        if (ports) {
            const comPort = ports[0].comName; // We want to connect to vComIndex 0
            if (comPort) {
                dispatch(
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
