/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    apps,
    Button,
    type Device,
    openWindow,
    selectedDevice,
    telemetry,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getPmicState } from '../../features/pmicControl/pmicControlSlice';
import { getSerialPort } from '../../features/serial/serialSlice';

enum EventAction {
    OPEN_SERIAL_TERMINAL = 'Open serial terminal',
}

export default () => {
    const device = useSelector(selectedDevice);
    const selectedUartSerialPort = useSelector(getSerialPort);
    const [appInstalled, setAppInstalled] = useState(false);
    const pmicConnection = useSelector(getPmicState);

    useEffect(() => {
        detectInstalledApp().then(setAppInstalled);
    }, []);

    return (
        <Button
            className="w-100 position-relative"
            onClick={() => {
                if (device && selectedUartSerialPort) {
                    openSerialTerminal(device, selectedUartSerialPort.path);
                }
            }}
            title={
                appInstalled
                    ? ''
                    : 'Serial Terminal is not installed, install it from nRF Connect For Desktop'
            }
            variant="secondary"
            disabled={!appInstalled || pmicConnection === 'ek-disconnected'}
        >
            Open Serial Terminal
            <span
                className="mdi mdi-open-in-new"
                style={{ position: 'absolute', right: '4px', fontSize: '16px' }}
            />
        </Button>
    );
};

const openSerialTerminal = (device: Device, serialPortPath: string) => {
    telemetry.sendEvent(EventAction.OPEN_SERIAL_TERMINAL);
    openWindow.openApp(
        { name: 'pc-nrfconnect-serial-terminal', source: 'official' },
        {
            device: {
                serialPortPath,
            },
        },
    );
};

const detectInstalledApp = async () => {
    const downloadableApps = await apps.getDownloadableApps();

    return downloadableApps.apps.some(
        app =>
            app.source === 'official' &&
            app.name === 'pc-nrfconnect-serial-terminal' &&
            apps.isInstalled(app),
    );
};
