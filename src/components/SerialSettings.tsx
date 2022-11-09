/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dropdown, Group, truncateMiddle } from 'pc-nrfconnect-shared';

import { createModem } from '../features/modem/modem';
import {
    getAvailableSerialPorts,
    getModem,
    getSelectedSerialport,
    setModem,
    setSelectedSerialport,
} from '../features/modem/modemSlice';

const SerialSettings = () => {
    const availablePorts = useSelector(getAvailableSerialPorts);
    const selectedSerialport = useSelector(getSelectedSerialport);
    const modem = useSelector(getModem);

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

    const selectedComPortItem = selectedSerialport
        ? comPortsDropdownItems[
              comPortsDropdownItems.findIndex(
                  e => e.value === selectedSerialport
              )
          ]
        : comPortsDropdownItems[0];

    const updateSerialPort = (portPath: string | undefined) => {
        if (typeof portPath === 'undefined') {
            return;
        }

        if (portPath !== 'Not connected') {
            const action = () =>
                dispatch(setModem(createModem(portPath as string)));

            modem ? modem?.close(action) : action();
        } else {
            setModem(undefined);
        }

        dispatch(setSelectedSerialport(portPath));
    };

    return (
        <Group heading="Serial Settings">
            <Dropdown
                onSelect={({ value }) => updateSerialPort(value)}
                items={comPortsDropdownItems}
                selectedItem={selectedComPortItem}
                disabled={availablePorts.length === 0}
            />
        </Group>
    );
};

export default SerialSettings;
