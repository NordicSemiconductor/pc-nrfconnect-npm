/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PaneProps } from 'pc-nrfconnect-shared';

import { getModem } from '../../features/modem/modemSlice';
import Terminal from './Terminal';

import './overlay.scss';

const Main = ({ active }: PaneProps) => {
    const modem = useSelector(getModem);

    const onModemData = useCallback(
        (listener: (data: Buffer) => Promise<void>) => {
            if (!modem) return () => {};

            const cleanup = modem.onResponse(listener);
            return () => cleanup();
        },
        [modem]
    );

    const onModemOpen = useCallback(
        (listener: () => void) => {
            if (!modem) return () => {};

            const cleanup = modem.onOpen(listener);
            return () => cleanup();
        },
        [modem]
    );

    const commandCallback = useCallback(
        (command: string) => {
            if (!modem) return 'Please connect a device';

            if (!modem.isOpen()) return 'Connection is not open';

            if (!modem?.write(command)) return 'Modem busy or invalid command';
        },
        [modem]
    );

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <Terminal
                    commandCallback={commandCallback}
                    onModemData={onModemData}
                    onModemOpen={onModemOpen}
                />
            )}
        </>
    );
};

export default Main;
