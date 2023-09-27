/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import {
    DeviceSelector,
    DeviceSetupConfig,
    getAppFile,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { DeviceTraits } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';

import { closeDevice, openDevice } from '../actions/deviceActions';
import { npm1300DeviceSetup } from '../features/pmicControl/npm/deviceSetups';
import {
    isNpm1300SerialApplicationMode,
    isNpm1300SerialRecoverMode,
} from '../features/pmicControl/npm/pmicHelpers';
import { stopEventRecording } from '../features/pmicControl/pmicControlSlice';
import { setCompleteStep } from '../features/pmicControl/profilingSlice';

/**
 * Configures which device types to show in the device selector.
 * The config format is described on
 * https://github.com/NordicSemiconductor/nrf-device-lister-js.
 */
const deviceListing: DeviceTraits = {
    mcuBoot: true,
    serialPorts: true,
};

const deviceSetupConfig: DeviceSetupConfig = {
    deviceSetups: [
        npm1300DeviceSetup({
            key: 'nPM1300',
            description: '',
            hex: getAppFile('fw/app_signed_0.9.2+5.hex'),
        }),
    ],
    confirmMessage:
        'Programming required. The nPM1300 EK FW version does not match the required FW version.',
};

export default () => {
    const dispatch = useDispatch();

    return (
        <DeviceSelector
            deviceSetupConfig={deviceSetupConfig}
            deviceListing={deviceListing}
            onDeviceConnected={device =>
                logger.info(`Device Connected SN:${device.serialNumber}`)
            }
            onDeviceDisconnected={device =>
                logger.info(`Device Disconnected SN:${device.serialNumber}`)
            }
            onDeviceSelected={device =>
                logger.info(`Selected device with s/n ${device.serialNumber}`)
            }
            onDeviceIsReady={device => {
                logger.info(
                    `Device setup ready for device with s/n ${device.serialNumber}`
                );
                dispatch(openDevice(device));
            }}
            onDeviceDeselected={() => {
                logger.info('Deselected device');
                dispatch(closeDevice());
                dispatch(
                    setCompleteStep({
                        level: 'terminal',
                        message: `The device disconnected.`,
                    })
                );
                dispatch(stopEventRecording());
            }}
            deviceFilter={device =>
                isNpm1300SerialRecoverMode(device) ||
                isNpm1300SerialApplicationMode(device)
            }
        />
    );
};
