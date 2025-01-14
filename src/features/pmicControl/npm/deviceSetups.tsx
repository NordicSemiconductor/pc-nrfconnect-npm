/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import {
    AppThunk,
    createSerialPort,
    Device,
    DeviceSetup,
    getAppDir,
    logger,
    setWaitForDevice,
    shellParser,
    xTerminalShellParserWrapper,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { NrfutilDeviceLib } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil/device';
import { Terminal } from '@xterm/headless';
import semver from 'semver';

import { RootState } from '../../../appReducer';
import { minimumHWVersion as minimumHWVersionNpm2100 } from './npm2100/pmic2100Device';
import { getNpmDevice } from './npmFactory';
import {
    dialogHandler,
    isNpm1300SerialApplicationMode,
    isNpm1300SerialRecoverMode,
    isNpm2100SerialApplicationMode,
    isNpm2100SerialRecoverMode,
} from './pmicHelpers';
import { PmicDialog } from './types';

type NpmFirmware = {
    key: string;
    description: string;
    hex: string;
};

const npm1300EngineeringCMessage = (
    <>
        <p>
            You have connected an nPM1300-EK with nPM1300 Engineering C. Due to
            a known issue with this nPM1300 version the following connections
            are needed.
        </p>
        <ul>
            <li>Connect VSYS (P7) to LSIN2 (P15) using jumper wire.</li>
            <li>Connect VSYS (P7) to LSOUT2 (P15) using jumper wire.</li>
            <li>Do not use load switch 2 for any other purpose.</li>
        </ul>
        <p>Refer to the nPM1300 errata for more information.</p>
        <p>Do you want to continue?</p>
        <p className="text-center">
            <img
                style={{ maxWidth: '100%' }}
                src={`${getAppDir()}/resources/ek1300EngineeringC.png`}
                alt="ek1300EngineeringC"
            />
        </p>
    </>
);

export const npm1300DeviceSetup = (firmware: NpmFirmware): DeviceSetup => ({
    supportsProgrammingMode: (device: Device) =>
        device.traits.mcuBoot === true &&
        device.traits.serialPorts === true &&
        (isNpm1300SerialRecoverMode(device) ||
            isNpm1300SerialApplicationMode(device)),
    getFirmwareOptions: device => [
        {
            key: firmware.key,
            description: firmware.description,
            programDevice: onProgress => dispatch =>
                new Promise<Device>((resolve, reject) => {
                    let success = false;
                    dispatch(
                        setWaitForDevice({
                            timeout: 60000,
                            when: programmedDevice =>
                                // device lib report device with wrong value initially so we have to wait until device is fully recognized
                                programmedDevice.serialPorts?.length === 2 &&
                                programmedDevice.traits.mcuBoot === true &&
                                device.traits.serialPorts === true &&
                                isNpm1300SerialApplicationMode(
                                    programmedDevice
                                ),
                            once: true,
                            onSuccess: dev => {
                                success = true;
                                resolve(dev);
                            },
                            onFail: reject,
                        })
                    );
                    NrfutilDeviceLib.program(device, firmware.hex, progress => {
                        onProgress(
                            progress.stepProgressPercentage,
                            progress.message
                        );
                    })
                        .then(() => {
                            onProgress(
                                100,
                                'Programming upload complete. Waiting for device to apply firmware and reboot. This will take around a minute.'
                            );
                        })
                        .catch(err => {
                            if (err && !success) {
                                reject(err.message);
                            }
                        });
                    logger.debug('firmware updated finished');
                }),
        },
    ],
    isExpectedFirmware:
        (
            device: Device
        ): AppThunk<
            RootState,
            Promise<{
                device: Device;
                validFirmware: boolean;
            }>
        > =>
        async dispatch => {
            if (!(device.serialPorts && device.serialPorts[0].comName)) {
                throw new Error('device does not have a serial port');
            }

            if (isNpm1300SerialRecoverMode(device)) {
                return {
                    device,
                    validFirmware: false,
                };
            }

            const port = await createSerialPort(
                {
                    path: device.serialPorts[0].comName,
                    baudRate: 115200,
                },
                { overwrite: true, settingsLocked: true }
            );

            const shellParserO = await shellParser(
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
                        /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                    errorRegex: /Error: /,
                    timeout: 5000,
                    columnWidth: 80,
                }
            );

            try {
                const npmDevice = await getNpmDevice(shellParserO, null);

                const result = await npmDevice.isSupportedVersion();

                const action = () => ({
                    device,
                    validFirmware: result.supported,
                });

                const version = await npmDevice.getPmicVersion();

                shellParserO.unregister();
                await port.close();

                if (
                    version === 2.0 ||
                    (Number.isNaN(version) && result.version === '0.7.0+0')
                ) {
                    const p = new Promise<{
                        device: Device;
                        validFirmware: boolean;
                    }>((resolve, reject) => {
                        const information: PmicDialog = {
                            type: 'alert',
                            doNotAskAgainStoreID: 'pmic1300-fp2-reset-issue',
                            message: npm1300EngineeringCMessage,
                            confirmLabel: 'Yes',
                            cancelLabel: 'No',
                            optionalLabel: "Yes, don't ask again",
                            title: 'Important notice!',
                            onConfirm: () => {
                                resolve(action());
                            },
                            onCancel: () => {
                                reject(new Error('Device setup cancelled'));
                            },
                            onOptional: () => {
                                action();
                            },
                        };

                        dispatch(dialogHandler(information));
                    });

                    return p;
                }

                return action();
            } catch (e) {
                shellParserO.unregister();
                await port.close();
                throw e;
            }
        },
    tryToSwitchToApplicationMode: () => () =>
        new Promise<Device | null>(resolve => {
            resolve(null);
        }),
});

export const npm2100DeviceSetup = (firmware: NpmFirmware): DeviceSetup => ({
    supportsProgrammingMode: (device: Device) =>
        device.traits.mcuBoot === true &&
        device.traits.serialPorts === true &&
        (isNpm2100SerialRecoverMode(device) ||
            isNpm2100SerialApplicationMode(device)),
    getFirmwareOptions: device => [
        {
            key: firmware.key,
            description: firmware.description,
            programDevice: onProgress => dispatch =>
                new Promise<Device>((resolve, reject) => {
                    let success = false;
                    dispatch(
                        setWaitForDevice({
                            timeout: 60000,
                            when: programmedDevice =>
                                // device lib report device with wrong value initially so we have to wait until device is fully recognized
                                programmedDevice.serialPorts?.length === 2 &&
                                programmedDevice.traits.mcuBoot === true &&
                                device.traits.serialPorts === true &&
                                isNpm2100SerialApplicationMode(
                                    programmedDevice
                                ),
                            once: true,
                            onSuccess: dev => {
                                success = true;
                                resolve(dev);
                            },
                            onFail: reject,
                        })
                    );
                    NrfutilDeviceLib.program(device, firmware.hex, progress => {
                        onProgress(
                            progress.stepProgressPercentage,
                            progress.message
                        );
                    })
                        .then(() => {
                            onProgress(
                                100,
                                'Programming upload complete. Waiting for device to apply firmware and reboot. This will take around a minute.'
                            );
                        })
                        .catch(err => {
                            if (err && !success) {
                                reject(err.message);
                            }
                        });
                    logger.debug('firmware updated finished');
                }),
        },
    ],
    isExpectedFirmware:
        (
            device: Device
        ): AppThunk<
            RootState,
            Promise<{
                device: Device;
                validFirmware: boolean;
            }>
        > =>
        async dispatch => {
            if (!(device.serialPorts && device.serialPorts[0].comName)) {
                throw new Error('device does not have a serial port');
            }

            if (isNpm2100SerialRecoverMode(device)) {
                return {
                    device,
                    validFirmware: false,
                };
            }

            const port = await createSerialPort(
                {
                    path: device.serialPorts[0].comName,
                    baudRate: 115200,
                },
                { overwrite: true, settingsLocked: true }
            );

            const shellParserO = await shellParser(
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
                        /[[][0-9]{2,}:[0-9]{2}:[0-9]{2}.[0-9]{3},[0-9]{3}] <([^<^>]+)> ([^:]+): .*(\r\n|\r|\n)$/,
                    errorRegex: /Error: /,
                    timeout: 5000,
                    columnWidth: 80,
                }
            );

            try {
                const npmDevice = await getNpmDevice(shellParserO, null);

                const result = await npmDevice.isSupportedVersion();

                const action = () => ({
                    device,
                    validFirmware: result.supported,
                });

                const hwVersion = await npmDevice.getHwVersion();

                shellParserO.unregister();
                await port.close();

                if (
                    (!hwVersion.version && result.version !== '0.2.4+0') ||
                    (hwVersion.version &&
                        semver.lt(hwVersion.version, minimumHWVersionNpm2100))
                ) {
                    return new Promise<{
                        device: Device;
                        validFirmware: boolean;
                    }>((_, reject) => {
                        const information: PmicDialog = {
                            type: 'alert',
                            message:
                                'Your device hardware version is too old and not compatible with this firmware',
                            confirmLabel: 'OK',
                            optionalLabel: "OK, don't mention it again",
                            title: 'Important notice!',
                            onConfirm: () => {
                                reject(new Error('Device setup cancelled'));
                            },
                            onOptional: () => {
                                reject(new Error('Device setup cancelled'));
                            },
                        };

                        dispatch(dialogHandler(information));
                    });
                }

                return action();
            } catch (e) {
                shellParserO.unregister();
                await port.close();
                throw e;
            }
        },
    tryToSwitchToApplicationMode: () => () =>
        new Promise<Device | null>(resolve => {
            resolve(null);
        }),
});
