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
    Step,
    useStopwatch,
} from 'pc-nrfconnect-shared';

import {
    getChargers,
    getLatestAdcSample,
    getNpmDevice,
    getPmicChargingState,
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
import { REPORTING_RATE } from '../helpers';
import { ElapsedTime } from '../TimeComponent';
import {
    ChargingTemperatureAlert,
    ProfilingTemperatureAlert,
} from './CommonAlerts';
import StepperProgress from './StepperProgress';

export default ({ isVisible }: { isVisible: boolean }) => {
    const npmDevice = useSelector(getNpmDevice);
    const usbPowered = useSelector(isUsbPowered);
    const chargers = useSelector(getChargers);
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
        const charging = usbPowered && batteryConnected && chargers[0].enabled;
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
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        variant="primary"
                        disabled={
                            !batteryFull || usbPowered || !batteryConnected
                        }
                        onClick={() => {
                            dispatch(setProfilingStage('Resting'));
                            npmDevice?.setAutoRebootDevice(false);
                            npmDevice
                                ?.setChargerEnabled(0, false)
                                .then(() => {
                                    npmDevice
                                        ?.getBatteryProfiler()
                                        ?.setProfile(
                                            REPORTING_RATE, // iBat
                                            REPORTING_RATE * 8, // tBat
                                            profile.vLowerCutOff,
                                            [
                                                ...profile.restingProfiles,
                                                ...profile.profilingProfiles,
                                            ]
                                        )
                                        .then(() => {
                                            npmDevice
                                                ?.getBatteryProfiler()
                                                ?.startProfiling();
                                        })
                                        .catch(message => {
                                            dispatch(
                                                setCompleteStep({
                                                    message,
                                                    level: 'danger',
                                                })
                                            );
                                        });
                                })
                                .catch(message => {
                                    dispatch(
                                        setCompleteStep({
                                            message,
                                            level: 'danger',
                                        })
                                    );
                                });
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
                {!batteryFull && !chargers[0]?.enabled && (
                    <Alert label="" variant="warning">
                        <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                            <span>
                                <strong>Action required:</strong> Charging has
                                been turned off.
                            </span>
                            <Button
                                variant="custom"
                                onClick={() => {
                                    chargers.forEach((_, i) =>
                                        npmDevice?.setChargerEnabled(i, true)
                                    );
                                }}
                            >
                                Turn on
                            </Button>
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
            </Group>
        </GenericDialog>
    );
};
