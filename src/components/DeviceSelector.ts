/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import {
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    DeviceSetupConfig,
    getAppFile,
    logger,
} from 'pc-nrfconnect-shared';

import {
    closeDevice,
    deviceConnected,
    deviceDisconnected,
    openDevice,
} from '../actions/deviceActions';
import { npm1300DeviceSetup } from '../features/pmicControl/npm/deviceSetups';
import {
    isNpm1300SerialApplicationMode,
    isNpm1300SerialRecoverMode,
} from '../features/pmicControl/npm/pmicHelpers';
import { stopEventRecording } from '../features/pmicControl/pmicControlSlice';
import { setCompleteStep } from '../features/pmicControl/profilingSlice';
import { TDispatch } from '../thunk';

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
            hex: getAppFile('fw/app_signed_0.9.0+0.hex'),
        }),
    ],
    confirmMessage:
        'Programming required. The nPM1300 EK FW version does not match the required FW version.',
};

const mapState = () => ({
    deviceListing,
    deviceSetupConfig,
});

/*
 * In these callbacks you may react on events when users (de)selected a device.
 * Leave out callbacks you do not need.
 *
 * Note that the callbacks releaseCurrentDevice and onDeviceIsReady
 * are only invoked, if a deviceSetup is defined.
 */
const mapDispatch = (dispatch: TDispatch): Partial<DeviceSelectorProps> => ({
    onDeviceSelected: (device: Device) => {
        logger.info(`Selected device with s/n ${device.serialNumber}`);
    },
    onDeviceDeselected: () => {
        logger.info('Deselected device');
        dispatch(closeDevice());
        dispatch(
            setCompleteStep({
                level: 'terminal',
                message: `The device disconnected.`,
            })
        );
        dispatch(stopEventRecording());
    },
    onDeviceIsReady: (device: Device) => {
        logger.info(
            `Device setup ready for device with s/n ${device.serialNumber}`
        );
        dispatch(openDevice(device));
    },
    onDeviceConnected: (device: Device) => {
        logger.info(`Device Connected SN:${device.serialNumber}`);
        dispatch(deviceConnected());
    },

    onDeviceDisconnected: (device: Device) => {
        logger.info(`Device Disconnected SN:${device.serialNumber}`);
        dispatch(deviceDisconnected());
    },
    deviceFilter: (device: Device) =>
        isNpm1300SerialRecoverMode(device) ||
        isNpm1300SerialApplicationMode(device),
});

export default connect(mapState, mapDispatch)(DeviceSelector);
