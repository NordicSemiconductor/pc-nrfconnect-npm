/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    clearWaitForDevice,
    describeError,
    DialogButton,
    GenericDialog,
    Step,
    useStopwatch,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getCharger,
    getLatestAdcSample,
    getNpmDevice,
    getPmicChargingState,
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
import { REPORTING_RATE } from '../helpers';
import { ElapsedTime } from '../TimeComponent';
import {
    ChargingTemperatureAlert,
    ProfilingTemperatureAlert,
} from './CommonAlerts';
import StepperProgress from './StepperProgress';

export default ({ isVisible }: { isVisible: boolean }) => {
    const npmDevice = useSelector(getNpmDevice);
    const usbPower = useSelector(getUsbPower);
    const usbPowered = usbPower.detectStatus !== 'No USB connection';
    const charger = useSelector(getCharger);
    const pmicChargingState = useSelector(getPmicChargingState);
    const batteryConnected = useSelector(isBatteryConnected);
    const profile = useSelector(getProfile);
    const adcSample = useSelector(getLatestAdcSample);
    const index = useSelector(getProfileIndex);
    const [batteryFull, setBatteryFull] = useState(
        pmicChargingState.batteryFull
    );

    const { time, pause } = useStopwatch({
        autoStart: true,
        resolution: 1000,
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if (pmicChargingState.batteryFull) {
            setBatteryFull(true);
            pause();
        }
    }, [pause, pmicChargingState]);

    let stepOverride: Partial<Step> | undefined;

    if (batteryFull) {
        stepOverride = {
            caption: 'Charging complete.',
            state: 'active',
        };
    } else if (!batteryFull) {
        const charging = usbPowered && batteryConnected && charger?.enabled;
        if (charging && !pmicChargingState.dieTempHigh) {
            stepOverride = {
                caption: `Charging ${
                    pmicChargingState.constantCurrentCharging
                        ? '(Constant current)'
                        : ''
                }${
                    pmicChargingState.constantVoltageCharging
                        ? '(Constant voltage)'
                        : ''
                }${pmicChargingState.trickleCharge ? '(Trickle Charge)' : ''}`,
                state: charging ? 'active' : 'warning',
            };
        } else if (pmicChargingState.dieTempHigh) {
            stepOverride = {
                caption: `Not charging (Die Temp High)`,
                state: charging ? 'active' : 'warning',
            };
        } else {
            stepOverride = {
                caption: 'Not charging',
                state: 'warning',
            };
        }
    }

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]}°C`}
            isVisible={isVisible}
            showSpinner={!batteryFull}
            className="app-dialog"
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={
                            !batteryFull || usbPowered || !batteryConnected
                        }
                        onClick={async () => {
                            dispatch(setProfilingStage('Resting'));
                            try {
                                await npmDevice?.setPOFThreshold(2.6);
                                npmDevice?.setAutoRebootDevice(false);
                                await npmDevice?.setChargerEnabled(false);
                                await npmDevice
                                    ?.getBatteryProfiler()
                                    ?.setProfile(
                                        REPORTING_RATE, // iBat
                                        REPORTING_RATE * 8, // tBat
                                        profile.vLowerCutOff,
                                        [
                                            ...profile.restingProfiles,
                                            ...profile.profilingProfiles,
                                        ]
                                    );
                                await npmDevice
                                    ?.getBatteryProfiler()
                                    ?.startProfiling();
                            } catch (e) {
                                dispatch(
                                    setCompleteStep({
                                        message: describeError(e),
                                        level: 'danger',
                                    })
                                );
                            }
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
                {batteryConnected && pmicChargingState.dieTempHigh && (
                    <Alert label="Danger: " variant="danger">
                        Die Temp High has been reached.
                    </Alert>
                )}
                {!batteryConnected && (
                    <Alert label="Action: " variant="warning">
                        Did not detect battery. Please ensure battery is
                        connected.
                    </Alert>
                )}
                {!batteryFull && !usbPowered && (
                    <Alert label="Action required: " variant="warning">
                        You must connect <strong>USB PMIC</strong> to continue
                    </Alert>
                )}
                {batteryFull && usbPowered && (
                    <Alert label="Action required: " variant="warning">
                        You must disconnect <strong>USB PMIC</strong> to
                        continue
                    </Alert>
                )}
                {batteryFull && !usbPowered && (
                    <Alert label="Action required: " variant="warning">
                        Click continue
                    </Alert>
                )}
                {!batteryFull && !charger?.enabled && (
                    <Alert label="" variant="warning">
                        <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                            <span>
                                <strong>Action required:</strong> Charging has
                                been turned off.
                            </span>
                            <button
                                type="button"
                                onClick={() => {
                                    npmDevice?.setChargerEnabled(true);
                                }}
                            >
                                Turn on
                            </button>
                        </div>
                    </Alert>
                )}
                {batteryFull && (
                    <ProfilingTemperatureAlert
                        currentTemperature={adcSample?.tBat}
                        expectedTemperature={profile.temperatures[index]}
                    />
                )}
                {!batteryFull && (
                    <ChargingTemperatureAlert
                        currentTemperature={adcSample?.tBat}
                        expectedTemperature={22.5}
                    />
                )}
                <StepperProgress currentProfilingStepOverride={stepOverride} />
                <ElapsedTime time={time} />
            </div>
        </GenericDialog>
    );
};
