/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
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
    getProfilingStage,
    setCompleteStep,
    setProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import { REPORTING_RATE } from '../helpers';
import StepperProgress from './StepperProgress';
import { ElapsedTime } from './TimeComponent';

export default () => {
    const npmDevice = useSelector(getNpmDevice);
    const usbPowered = useSelector(isUsbPowered);
    const chargers = useSelector(getChargers);
    const pmicChargingState = useSelector(getPmicChargingState);
    const batteryConnected = useSelector(isBatteryConnected);
    const profilingStage = useSelector(getProfilingStage);
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

    if (!batteryConnected) {
        stepOverride = {
            caption:
                'Did not detect battery. Please ensure battery is connected.',
            state: 'warning',
        };
    } else if (!batteryFull && !usbPowered) {
        stepOverride = {
            caption: 'Please connect USB PMIC to continue',
            state: 'warning',
        };
    } else if (batteryFull && usbPowered) {
        stepOverride = {
            caption: 'Please disconnect USB PMIC to continue',
            state: 'warning',
        };
    } else if (!batteryFull && !chargers[0]?.enabled) {
        stepOverride = {
            caption: [
                {
                    id: '1',
                    caption: 'Charging has been turned off',
                },
                {
                    id: '2',
                    caption: 'Try Again',
                    action: () => {
                        chargers.forEach((_, i) =>
                            npmDevice?.setChargerEnabled(i, true)
                        );
                    },
                },
            ],
            state: 'warning',
        };
    } else if (batteryFull) {
        stepOverride = {
            caption: 'Charging complete. Battery full click continue',
            state: 'warning',
        };
    } else if (!batteryFull) {
        stepOverride = {
            caption:
                usbPowered && batteryConnected && chargers[0].enabled
                    ? `Charging ${
                          pmicChargingState.constantCurrentCharging
                              ? '(Constant current)'
                              : ''
                      }${
                          pmicChargingState.constantVoltageCharging
                              ? '(Constant voltage)'
                              : ''
                      }`
                    : 'Not charging',
            state: 'active',
        };
    }

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]} °C`}
            isVisible={profilingStage === 'Charging'}
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
                            dispatch(closeProfiling());
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <Group>
                {batteryFull && (
                    <Alert
                        label="Info "
                        variant="info"
                    >{`Make sure battery is in the oven with a temperature of ${profile.temperatures[index]} °C. Current NTC temperature ${adcSample?.tBat} °C`}</Alert>
                )}
                <StepperProgress currentProfilingStepOverride={stepOverride} />
                <ElapsedTime time={time} />
            </Group>
        </GenericDialog>
    );
};
