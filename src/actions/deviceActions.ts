/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device, logger } from 'pc-nrfconnect-shared';

import { createModem } from '../features/modem/modem';
import {
    setAvailableSerialPorts,
    setModem,
    setSelectedSerialport,
    setShellParser,
} from '../features/modem/modemSlice';
import { TAction } from '../thunk';

export const closeDevice = (): TAction => dispatch => {
    logger.info('Closing device');
    dispatch(setAvailableSerialPorts([]));
    dispatch(setSelectedSerialport(undefined));
    dispatch(setModem(undefined));
    dispatch(setShellParser(undefined));
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
                await dispatch(setModem(await createModem(comPort)));
            }
        }
    };

export const deviceConnected =
    (device: Device): TAction =>
    () => {
        logger.info(`Device Connected SN:${device.serialNumber}`);
    };

export const deviceDisconnected =
    (device: Device): TAction =>
    () => {
        logger.info(`Device Disconnected SN:${device.serialNumber}`);
    };
