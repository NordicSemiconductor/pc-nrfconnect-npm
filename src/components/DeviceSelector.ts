/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { connect } from 'react-redux';
import nrfDeviceLib, {
    DeviceTraits,
} from '@nordicsemiconductor/nrf-device-lib-js';
import {
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    getDeviceLibContext,
    IDeviceSetup,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';

import {
    closeDevice,
    deviceConnected,
    deviceDisconnected,
    openDevice,
} from '../actions/deviceActions';
import { RootState } from '../appReducer';
import { closeProfiling } from '../features/pmicControl/profilingSlice';

/**
 * Configures which device types to show in the device selector.
 * The config format is described on
 * https://github.com/NordicSemiconductor/nrf-device-lister-js.
 */
const deviceListing: DeviceTraits = {
    mcuBoot: true,
    serialPorts: true,
};

type NpmFirmware = {
    key: string;
    description: string;
    hex: string;
};

export const npmDeviceSetup = (firmware: NpmFirmware): IDeviceSetup => ({
    supportsProgrammingMode: (device: Device) =>
        device.traits.mcuBoot !== undefined &&
        device.usb?.device.descriptor.idProduct === 0x53ab &&
        device.usb?.device.descriptor.idVendor === 0x1915,
    getFirmwareOptions: device => [
        {
            key: firmware.key,
            description: firmware.description,
            programDevice: onProgress => dispatch =>
                new Promise<Device>((resolve, reject) => {
                    dispatch(
                        setWaitForDevice({
                            timeout: 60000,
                            when: 'always',
                            once: true,
                            onSuccess: resolve,
                            onFail: reject,
                        })
                    );
                    nrfDeviceLib.firmwareProgram(
                        getDeviceLibContext(),
                        device.id,
                        'NRFDL_FW_FILE',
                        'NRFDL_FW_INTEL_HEX',
                        firmware.hex as string,
                        err => {
                            if (err) {
                                reject(err.message);
                            }
                        },
                        progress => {
                            onProgress(
                                progress.progressJson.progressPercentage,
                                progress.progressJson.message
                            );
                        }
                    );
                    logger.debug('firmware updated finished');
                }),
        },
    ],
    isExpectedFirmware: (device: Device) => (dispatch, getState) =>
        new Promise<{
            device: Device;
            validFirmware: boolean;
        }>(resolve => {
            (getState() as RootState).app.pmicControl.npmDevice
                ?.isSupportedVersion()
                .then(result => {
                    resolve({
                        device,
                        validFirmware: result,
                    });
                });
        }),
    tryToSwitchToApplicationMode: device => () =>
        new Promise<Device>(resolve => {
            resolve(device);
        }),
});

const deviceSetup = {
    dfu: {},
    jprog: {},
};

const mapState = () => ({
    deviceListing,
    deviceSetup,
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
        dispatch(openDevice(device));
    },
    onDeviceDeselected: () => {
        logger.info('Deselected device');
        dispatch(closeDevice());
        dispatch(closeProfiling());
    },
    onDeviceConnected: (device: Device) => {
        logger.info(`Device Connected SN:${device.serialNumber}`);
        dispatch(deviceConnected());
    },

    onDeviceDisconnected: (device: Device) => {
        logger.info(`Device Disconnected SN:${device.serialNumber}`);
        dispatch(deviceDisconnected());
    },
});

export default connect(mapState, mapDispatch)(DeviceSelector);
