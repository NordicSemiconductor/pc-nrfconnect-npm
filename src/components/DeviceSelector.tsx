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
import { DeviceTraits } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import path from 'path';

import { closeDevice, openDevice } from '../actions/deviceActions';
import {
    npm1300DeviceSetup,
    npm1304DeviceSetup,
    npm2100DeviceSetup,
} from '../features/pmicControl/npm/deviceSetups';
import Npm1300, {
    npm1300FWVersion,
} from '../features/pmicControl/npm/npm1300/pmic1300Device';
import Npm1304, {
    npm1304FWVersion,
} from '../features/pmicControl/npm/npm1304/pmic1304Device';
import Npm2100, {
    npm2100FWVersion,
} from '../features/pmicControl/npm/npm2100/pmic2100Device';
import {
    dialogHandler,
    isNpm1300SerialApplicationMode,
    isNpm1300SerialRecoverMode,
    isNpm1304SerialApplicationMode,
    isNpm1304SerialRecoverMode,
    isNpm2100SerialApplicationMode,
    isNpm2100SerialRecoverMode,
} from '../features/pmicControl/npm/pmicHelpers';
import {
    setNpmDevice,
    stopEventRecording,
} from '../features/pmicControl/pmicControlSlice';
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
            hex: getAppFile(
                path.join('fw', `app_signed_nPM1300_${npm1300FWVersion}.hex`),
            ),
        }),
        npm1304DeviceSetup({
            key: 'nPM1304',
            description: '',
            hex: getAppFile(
                path.join('fw', `app_signed_nPM1304_${npm1304FWVersion}.hex`),
            ),
        }),
        npm2100DeviceSetup({
            key: 'nPM2100',
            description: '',
            hex: getAppFile(
                path.join('fw', `app_signed_nPM2100_${npm2100FWVersion}.hex`),
            ),
        }),
    ],
    confirmMessage:
        'Programming required. The nPM EK firmware version does not match the required firmware version.',
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
                    `Device setup ready for device with s/n ${device.serialNumber}`,
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
                    }),
                );
                dispatch(stopEventRecording());
            }}
            deviceFilter={device =>
                isNpm1300SerialRecoverMode(device) ||
                isNpm1300SerialApplicationMode(device) ||
                isNpm1304SerialRecoverMode(device) ||
                isNpm1304SerialApplicationMode(device) ||
                isNpm2100SerialApplicationMode(device) ||
                isNpm2100SerialRecoverMode(device)
            }
            virtualDevices={['nPM1300', 'nPM1304', 'nPM2100']}
            onVirtualDeviceSelected={device => {
                if (device === 'nPM1300') {
                    dispatch(
                        setNpmDevice(
                            new Npm1300(undefined, pmicDialog =>
                                dispatch(dialogHandler(pmicDialog)),
                            ),
                        ),
                    );
                } else if (device === 'nPM1304') {
                    dispatch(
                        setNpmDevice(
                            new Npm1304(
                                undefined,
                                pmicDialog =>
                                    dispatch(dialogHandler(pmicDialog)),
                                undefined,
                                1.0,
                            ),
                        ),
                    );
                } else if (device === 'nPM2100') {
                    dispatch(
                        setNpmDevice(
                            new Npm2100(undefined, pmicDialog =>
                                dispatch(dialogHandler(pmicDialog)),
                            ),
                        ),
                    );
                }
            }}
            onVirtualDeviceDeselected={() => {
                dispatch(setNpmDevice(undefined));
            }}
        />
    );
};
