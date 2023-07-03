/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
import {
    AppThunk,
    createSerialPort,
    Device,
    DeviceSetup,
    getAppDir,
    getDeviceLibContext,
    logger,
    setWaitForDevice,
} from 'pc-nrfconnect-shared';
import { Terminal } from 'xterm-headless';

import { RootState } from '../../../appReducer';
import {
    hookModemToShellParser,
    xTerminalShellParserWrapper,
} from '../../../hooks/commandParser';
import { getNpmDevice } from './npmFactory';
import {
    dialogHandler,
    isNpm1300SerialApplicationMode,
    isNpm1300SerialRecoverMode,
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
                    nrfDeviceLib.firmwareProgram(
                        getDeviceLibContext(),
                        device.id,
                        'NRFDL_FW_FILE',
                        'NRFDL_FW_INTEL_HEX',
                        firmware.hex,
                        err => {
                            if (err && !success) {
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
        dispatch =>
            new Promise<{
                device: Device;
                validFirmware: boolean;
            }>((resolve, reject) => {
                if (!(device.serialPorts && device.serialPorts[0].comName)) {
                    reject(new Error('device does not have a serial port'));
                    return;
                }

                if (isNpm1300SerialRecoverMode(device)) {
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
                                                const action = () => {
                                                    resolve({
                                                        device,
                                                        validFirmware:
                                                            result.supported,
                                                    });
                                                };

                                                npmDevice
                                                    .getPmicVersion()
                                                    .then(version => {
                                                        port.close().finally(
                                                            () => {
                                                                if (
                                                                    version ===
                                                                        2.0 ||
                                                                    (Number.isNaN(
                                                                        version
                                                                    ) &&
                                                                        result.version ===
                                                                            '0.7.0+0')
                                                                ) {
                                                                    // FP2
                                                                    const information: PmicDialog =
                                                                        {
                                                                            type: 'alert',
                                                                            doNotAskAgainStoreID:
                                                                                'pmic1300-fp2-reset-issue',
                                                                            message:
                                                                                npm1300EngineeringCMessage,
                                                                            confirmLabel:
                                                                                'Yes',
                                                                            cancelLabel:
                                                                                'No',
                                                                            optionalLabel:
                                                                                "Yes, don't ask again",
                                                                            title: 'Important notice!',
                                                                            onConfirm:
                                                                                action,
                                                                            onCancel:
                                                                                () => {
                                                                                    reject(
                                                                                        new Error(
                                                                                            'Device setup cancelled'
                                                                                        )
                                                                                    );
                                                                                },
                                                                            onOptional:
                                                                                action,
                                                                        };

                                                                    dispatch(
                                                                        dialogHandler(
                                                                            information
                                                                        )
                                                                    );
                                                                } else {
                                                                    action();
                                                                }
                                                            }
                                                        );
                                                    });
                                            })
                                            .catch(error =>
                                                port
                                                    .close()
                                                    .finally(() =>
                                                        reject(error)
                                                    )
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
    tryToSwitchToApplicationMode: () => () =>
        new Promise<Device | null>(resolve => {
            resolve(null);
        }),
});
