/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PaneProps } from 'pc-nrfconnect-shared';

import { getSerialPort } from '../../features/serial/serialSlice';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const serialPort = useSelector(getSerialPort);

    const onSerialData = useCallback(
        (listener: (data: Uint8Array) => Promise<void>) => {
            if (!serialPort) return () => {};

            const cleanup = serialPort.onData(listener);
            return () => cleanup();
        },
        [serialPort]
    );

    const commandCallback = useCallback(
        (command: string) => {
            if (!serialPort) return 'Please connect a device';

            if (!serialPort.isOpen()) return 'Connection is not open';

            serialPort.write(command);
        },
        [serialPort]
    );

    return active ? (
        <Terminal
            commandCallback={commandCallback}
            onSerialData={onSerialData}
        />
    ) : null;
};

export default Main;
