/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Button,
    DialogButton,
    GenericDialog,
    Group,
} from 'pc-nrfconnect-shared';

import {
    getLatestAdcSample,
    getNpmDevice,
    getPmicState,
    isBatteryConnected,
    isUsbPowered,
} from '../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getProfile,
    getProfileIndex,
    setCompleteStep,
    setProfilingStage,
} from '../../features/pmicControl/profilingSlice';

export default () => {
    const adcSample = useSelector(getLatestAdcSample);
    const npmDevice = useSelector(getNpmDevice);
    const profile = useSelector(getProfile);
    const pmicConnectionState = useSelector(getPmicState);
    const usbPowered = useSelector(isUsbPowered);
    const batteryConnected = useSelector(isBatteryConnected);
    const index = useSelector(getProfileIndex);

    const dispatch = useDispatch();

    const [syncBoardConnected, setSyncBoardConnected] = useState<
        boolean | null
    >();

    useEffect(() => {
        if (pmicConnectionState === 'pmic-connected') {
            npmDevice
                ?.getBatteryProfiler()
                ?.canProfile()
                .then(result => {
                    setSyncBoardConnected(result);
                });
        }
    }, [npmDevice, pmicConnectionState]);

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            closeOnEsc={false}
            footer={
                <>
                    {syncBoardConnected === true && (
                        <DialogButton
                            disabled={
                                pmicConnectionState !== 'pmic-connected' ||
                                !usbPowered ||
                                !batteryConnected ||
                                !syncBoardConnected
                            }
                            variant="primary"
                            onClick={async () => {
                                await npmDevice?.setFuelGaugeEnabled(false);

                                // PMIC 1300 Specific
                                await npmDevice?.setLdoEnabled(0, false);
                                await npmDevice?.setLdoEnabled(1, false);
                                await npmDevice?.setBuckEnabled(0, false);

                                await npmDevice?.setFuelGaugeEnabled(false);
                                await npmDevice
                                    ?.setChargerVTerm(0, profile.vUpperCutOff)
                                    .catch(message => {
                                        dispatch(
                                            setCompleteStep({
                                                message,
                                                level: 'danger',
                                            })
                                        );
                                    });
                                await npmDevice
                                    ?.setChargerIChg(
                                        0,
                                        Math.min(
                                            800,
                                            Math.floor(
                                                profile.capacity ?? 0 / 2
                                            ) * 2 // even numbers only are allowed
                                        )
                                    )
                                    .catch(message => {
                                        dispatch(
                                            setCompleteStep({
                                                message,
                                                level: 'danger',
                                            })
                                        );
                                    });
                                await npmDevice
                                    ?.setChargerEnabled(0, true)
                                    .catch(message => {
                                        dispatch(
                                            setCompleteStep({
                                                message,
                                                level: 'danger',
                                            })
                                        );
                                    });
                                dispatch(setProfilingStage('Charging'));
                            }}
                        >
                            Continue
                        </DialogButton>
                    )}

                    <DialogButton
                        onClick={() => {
                            dispatch(closeProfiling());
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <Group>
                {pmicConnectionState === 'pmic-disconnected' && (
                    <Alert label="Warning " variant="warning">
                        PMIC is not powered.
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-pending-reboot' && (
                    <Alert label="" variant="warning">
                        <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                            <span>
                                <strong>Warning </strong>PMIC Pending device
                                restart.
                            </span>
                            <Button
                                variant="custom"
                                onClick={() => {
                                    npmDevice?.kernelReset();
                                }}
                            >
                                Reboot now
                            </Button>
                        </div>
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-unknown' && (
                    <Alert label="Info " variant="info">
                        Waiting to connect to PMIC
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-connected' &&
                    syncBoardConnected === true && (
                        <>
                            {!usbPowered && (
                                <Alert label="Warning " variant="warning">
                                    Connect USB PMIC to continue
                                </Alert>
                            )}
                            {!batteryConnected && (
                                <Alert label="Warning " variant="warning">
                                    Battery is not detected. Make sure it is
                                    connected to the EK to continue
                                </Alert>
                            )}
                            <Alert
                                label="Info "
                                variant="info"
                            >{`Make sure battery is at room temperature before charging (20 °C - 25 °C). Current NTC temperature ${
                                adcSample?.tBat ?? NaN
                            } °C`}</Alert>
                        </>
                    )}
                {pmicConnectionState === 'pmic-connected' &&
                    syncBoardConnected === false && (
                        <Alert label="Error " variant="danger">
                            Sync board is not connected. Turn off EK and connect
                            Sync board to the EK
                        </Alert>
                    )}
                {pmicConnectionState === 'pmic-connected' &&
                    syncBoardConnected === null && (
                        <Alert label="Info " variant="info">
                            Checking for Sync board connection.
                        </Alert>
                    )}
            </Group>
        </GenericDialog>
    );
};
