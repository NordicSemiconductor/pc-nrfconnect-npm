/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import {
    createSerialPort,
    Dropdown,
    Group,
    truncateMiddle,
} from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

import {
    getAvailableSerialPorts,
    getSelectedSerialport,
    getSerialPort,
    setSelectedSerialport,
    setSerialPort,
} from '../../features/serial/serialSlice';

const SerialSettings = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const modem = useSelector(getSerialPort);

    const dispatch = useDispatch();

    const comPortsDropdownItems =
        availablePorts.length > 0
            ? [
                  { label: 'Not connected', value: 'Not connected' },
                  ...availablePorts.map(portPath => ({
                      label: truncateMiddle(portPath, 20, 8),
                      value: portPath as string,
                  })),
              ]
            : [{ label: 'Not connected', value: 'Not connected' }];

    const selectedComPortItem =
        comPortsDropdownItems[
            Math.max(
                0,
                comPortsDropdownItems.findIndex(
                    e => e.value === selectedSerialport
                )
            )
        ];

    const updateSerialPort = async (portPath: string | undefined) => {
        if (typeof portPath === 'undefined') {
            return;
        }

        if (portPath !== 'Not connected') {
            const action = async () =>
                dispatch(
                    setSerialPort(
                        await createSerialPort(
                            {
                                path: portPath,
                                baudRate: 115200,
                            } as SerialPortOpenOptions<AutoDetectTypes>,
                            { overwrite: true, settingsLocked: true }
                        )
                    )
                );

            if (modem?.isOpen()) modem.close().then(await action);
            else action();
        } else {
            setSerialPort(undefined);
        }

        dispatch(setSelectedSerialport(portPath));
    };

    return (
        <Group heading="Serial Settings">
            <Dropdown
                onSelect={({ value }) => updateSerialPort(value)}
                items={comPortsDropdownItems}
                selectedItem={selectedComPortItem}
                disabled
            />
        </Group>
    );
};

export default SerialSettings;
