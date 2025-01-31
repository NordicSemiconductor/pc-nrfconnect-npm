/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    clearWaitForDevice,
    DialogButton,
    GenericDialog,
    getWaitingForDeviceTimeout,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getCharger,
    getLatestAdcSample,
    getNpmDevice,
    getPmicState,
    getUsbPower,
    isBatteryConnected,
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

export default ({ isVisible }: { isVisible: boolean }) => {
    const adcSample = useSelector(getLatestAdcSample);
    const npmDevice = useSelector(getNpmDevice);
    const profile = useSelector(getProfile);
    const charger = useSelector(getCharger);
    const pmicConnectionState = useSelector(getPmicState);
    const usbPower = useSelector(getUsbPower);
    const usbPowered =
        usbPower && usbPower.detectStatus !== 'No USB connection';
    const batteryConnected = useSelector(isBatteryConnected);
    const waitingForDevice = useSelector(getWaitingForDeviceTimeout);
    const index = useSelector(getProfileIndex);

    const dispatch = useDispatch();

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]}°C`}
            isVisible={isVisible}
            className="app-dialog"
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
                            // PMIC 1300 Specific
                            await npmDevice?.ldoModule[0]?.set.enabled(false);
                            await npmDevice?.ldoModule[1]?.set.enabled(false);
                            await npmDevice?.buckModule[0]?.set.enabled(false);

                            await npmDevice?.fuelGaugeModule?.set.enabled(
                                false
                            );
                            await npmDevice?.chargerModule?.set.nTCThermistor(
                                profile.ntcThermistor
                            );
                            await npmDevice?.chargerModule?.set
                                .vTerm(profile.vUpperCutOff)
                                .catch(message => {
                                    dispatch(
                                        setCompleteStep({
                                            message,
                                            level: 'danger',
                                        })
                                    );
                                });
                            await npmDevice?.chargerModule?.set
                                .iChg(
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
                            await npmDevice?.chargerModule?.set
                                .enabled(true)
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
                                    dispatch(clearWaitForDevice());
                                })
                            );
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <div className="tw-flex tw-flex-col tw-gap-2">
                {adcSample &&
                    adcSample.vBat > profile.vUpperCutOff &&
                    !charger?.enabled && (
                        <Alert label="Caution: " variant="warning">
                            The battery voltage exceeds V
                            <span className="subscript">TERM</span>. This might
                            effect results. It is recommended to discharge the
                            battery below V
                            <span className="subscript">TERM</span> before
                            starting battery profiling.
                        </Alert>
                    )}
                {pmicConnectionState === 'pmic-disconnected' && (
                    <Alert label="Action required: " variant="warning">
                        You must power the PMIC. Connect the battery and USB
                        PMIC.
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-pending-reboot' && (
                    <Alert label="" variant="warning">
                        <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                            <span>
                                <strong>Caution: </strong>PMIC Pending device
                                restart.
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    npmDevice?.kernelReset();
                                }}
                            >
                                Reboot now
                            </button>
                        </div>
                    </Alert>
                )}
                {(pmicConnectionState === 'pmic-pending-rebooting' ||
                    waitingForDevice) && (
                    <Alert label="Caution: " variant="warning">
                        Waiting to for device to reconnect...
                    </Alert>
                )}
                {pmicConnectionState === 'pmic-connected' && (
                    <>
                        {!usbPowered && (
                            <Alert label="Action required: " variant="warning">
                                You must connect <strong>USB PMIC</strong> to
                                continue
                            </Alert>
                        )}
                        {!batteryConnected && (
                            <Alert label="Important: " variant="warning">
                                No battery is detected. Make sure battery is
                                connected to the EK before you continue
                            </Alert>
                        )}
                        <ChargingTemperatureAlert
                            ntcThermistor={profile.ntcThermistor}
                            expectedTemperature={22.5}
                            currentTemperature={adcSample?.tBat}
                        />
                    </>
                )}
            </div>
        </GenericDialog>
    );
};
