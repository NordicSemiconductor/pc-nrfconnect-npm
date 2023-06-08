/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Button,
    DialogButton,
    GenericDialog,
    getWaitingForDeviceTimeout,
    Group,
} from 'pc-nrfconnect-shared';

import {
    getLatestAdcSample,
    getNpmDevice,
    getPmicState,
    isBatteryConnected,
    isUsbPowered,
} from '../../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getProfile,
    getProfileIndex,
    setAbortAction,
    setCompleteStep,
    setProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import { ChargingTemperatureAlert } from './CommonAlerts';

export default () => {
    const adcSample = useSelector(getLatestAdcSample);
    const npmDevice = useSelector(getNpmDevice);
    const profile = useSelector(getProfile);
    const pmicConnectionState = useSelector(getPmicState);
    const usbPowered = useSelector(isUsbPowered);
    const batteryConnected = useSelector(isBatteryConnected);
    const waitingForDevice = useSelector(getWaitingForDeviceTimeout);
    const index = useSelector(getProfileIndex);

    const dispatch = useDispatch();

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        disabled={
                            pmicConnectionState !== 'pmic-connected' ||
                            !usbPowered // Do not add !batteryConnected as battery might be to low that it is not detected
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
                                            profile.ratedChargingCurrent / 2
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

                    <DialogButton
                        onClick={() => {
                            dispatch(
                                setAbortAction(() => {
                                    dispatch(closeProfiling());
                                })
                            );
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <Group>
                {pmicConnectionState === 'pmic-disconnected' && (
                    <Alert label="Caution: " variant="warning">
                        PMIC is not powered.
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-pending-reboot' && (
                    <Alert label="" variant="warning">
                        <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                            <span>
                                <strong>Caution: </strong>PMIC Pending device
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
                {(pmicConnectionState === 'pmic-pending-rebooting' ||
                    waitingForDevice) && (
                    <Alert label="Note: " variant="info">
                        Waiting to for PMIC to reboot
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-connected' && (
                    <>
                        {!usbPowered && (
                            <Alert label="Action: " variant="warning">
                                Please connect USB PMIC to continue
                            </Alert>
                        )}
                        {!batteryConnected && (
                            <Alert label="Caution: " variant="warning">
                                Battery is not detected. Make sure it is
                                connected to the Evaluation Kit before you
                                continue
                            </Alert>
                        )}
                        <ChargingTemperatureAlert
                            expectedTemperature={22.5}
                            currentTemperature={adcSample?.tBat}
                        />
                    </>
                )}
            </Group>
        </GenericDialog>
    );
};
