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
    createSerialPort,
    Device,
    DeviceSelector,
    DeviceSelectorProps,
    DeviceSetup,
    DeviceSetupConfig,
    getAppFile,
    getDeviceLibContext,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import {
    closeDevice,
    deviceConnected,
    deviceDisconnected,
    openDevice,
} from '../actions/deviceActions';
import { getNpmDevice } from '../features/pmicControl/npm/npmFactory';
import { closeProfiling } from '../features/pmicControl/profilingSlice';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../hooks/commandParser';
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

type NpmFirmware = {
    key: string;
    description: string;
    hex: string;
};

export const npmDeviceSetup = (firmware: NpmFirmware): DeviceSetup => ({
    supportsProgrammingMode: (device: Device) =>
        device.traits.mcuBoot === true &&
        device.traits.serialPorts === true &&
        (device.usb?.device.descriptor.idProduct === 0x53ab ||
            device.usb?.device.descriptor.idProduct === 0x53ac) &&
        device.usb?.device.descriptor.idVendor === 0x1915,
    getFirmwareOptions: device => [
        {
            key: firmware.key,
            description: firmware.description,
            programDevice: onProgress => dispatch =>
                new Promise<Device>((resolve, reject) => {
                    let readyDevice: Device = device;
                    dispatch(
                        setWaitForDevice({
                            timeout: 60000,
                            when: programmedDevice =>
                                // device lib report device with wrong value initially so we have to wait until device is fully recognized
                                programmedDevice.serialPorts?.length === 2 &&
                                programmedDevice.traits.mcuBoot === true &&
                                device.traits.serialPorts === true &&
                                programmedDevice.usb?.device.descriptor
                                    .idProduct === 0x53ab &&
                                programmedDevice.usb?.device.descriptor
                                    .idVendor === 0x1915,
                            once: true,
                            onSuccess: dev => {
                                readyDevice = dev;
                            },
                            onFail: reject,
                        })
                    );
                    nrfDeviceLib.firmwareProgram(
                        getDeviceLibContext(),
                        device.id,
                        'NRFDL_FW_FILE',
                        'NRFDL_FW_INTEL_HEX',
                        firmware.hex,
                        err => {
                            if (err) {
                                reject(err.message);
                                return;
                            }

                            resolve(readyDevice);
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
    isExpectedFirmware: (device: Device) => () =>
        new Promise<{
            device: Device;
            validFirmware: boolean;
        }>((resolve, reject) => {
            if (!(device.serialPorts && device.serialPorts[0].comName)) {
                reject(new Error('device does not have a serial port'));
                return;
            }

            if (device.usb?.device.descriptor.idProduct === 0x53ac) {
                resolve({
                    device,
                    validFirmware: false,
                });
                return;
            }

            createSerialPort(
                {
                    path: device.serialPorts[0].comName,
                    baudRate: 115200,
                },
                { overwrite: true, settingsLocked: true }
            )
                .then(port => {
                    hookModemToShellParser(
                        port,
                        xTerminalShellParserWrapper(
                            new Terminal({
                                allowProposedApi: true,
                                cols: 999,
                            })
                        ),
                        {
                            shellPromptUart: 'shell:~$ ',
                            logRegex:
                                /[[][0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                            errorRegex: /Error: /,
                            timeout: 5000,
                            columnWidth: 80,
                        }
                    )
                        .then(shellParser => {
                            getNpmDevice(shellParser, null)
                                .then(npmDevice => {
                                    npmDevice
                                        .isSupportedVersion()
                                        .then(result => {
                                            port.close().finally(() =>
                                                resolve({
                                                    device,
                                                    validFirmware: result,
                                                })
                                            );
                                        })
                                        .catch(error =>
                                            port
                                                .close()
                                                .finally(() => reject(error))
                                        )
                                        .finally();
                                })
                                .catch(reject);
                        })
                        .catch(error => {
                            port.close();
                            reject(error);
                        });
                })
                .catch(reject);
        }),
    tryToSwitchToApplicationMode: device => () =>
        new Promise<Device>(resolve => {
            resolve(device);
        }),
});

const deviceSetupConfig: DeviceSetupConfig = {
    deviceSetups: [
        npmDeviceSetup({
            key: 'nPM1300',
            description: '',
            hex: getAppFile('fw/app_signed_0.7.1+0.hex'),
        }),
    ],
    confirmMessage:
        'The Evaluation Kit requires programming. Do you want to program it?',
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
        dispatch(closeProfiling());
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
});

export default connect(mapState, mapDispatch)(DeviceSelector);
