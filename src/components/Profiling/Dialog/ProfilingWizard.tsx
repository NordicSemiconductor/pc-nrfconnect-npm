/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync, mkdirSync } from 'fs';
import path from 'path';

import { RootState } from '../../../appReducer';
import { startProcessingCsv } from '../../../features/nrfutillNpm/csvProcessing';
import {
    getBucks,
    getFuelGauge,
    getLdos,
    getNpmDevice,
    isBatteryConnected,
    isUsbPowered,
    setEventRecordingPath,
} from '../../../features/pmicControl/pmicControlSlice';
import {
    getCcProfilingState,
    getProfile,
    getProfileIndex,
    getProfilingStage,
    incrementCapacityConsumed,
    setCompleteStep,
    setLatestTBat,
    setProfilingStage,
} from '../../../features/pmicControl/profilingSlice';
import { TDispatch } from '../../../thunk';
import {
    atomicUpdateProjectSettings,
    generateDefaultProjectPath,
    PROFILE_FOLDER_PREFIX,
    REPORTING_RATE,
} from '../helpers';
import ChargingDialog from './ChargingDialog';
import ChecklistDialog from './ChecklistDialog';
import CompleteDialog from './CompleteDialog';
import ConfigurationDialog from './ConfigurationDialog';
import PreConfigurationDialog from './PreConfigurationDialog';
import ProfilingDialog from './ProfilingDialog';
import RestingDialog from './RestingDialog';

const markProfilersAsReady =
    () => (dispatch: TDispatch, getState: () => RootState) => {
        const profile = getState().app.profiling.profile;
        const index = getState().app.profiling.index;

        const fileName = generateDefaultProjectPath(profile);
        dispatch(
            atomicUpdateProjectSettings(fileName, profileSettings => {
                profileSettings.profiles[index].csvReady = true;

                return profileSettings;
            })
        );

        dispatch(startProcessingCsv(profile, index));
    };

export default () => {
    const timeOffset = useRef(-1);

    const npmDevice = useSelector(getNpmDevice);
    const profilingStage = useSelector(getProfilingStage);
    const profile = useSelector(getProfile);
    const batteryConnected = useSelector(isBatteryConnected);
    const usbPowered = useSelector(isUsbPowered);
    const ldos = useSelector(getLdos);
    const bucks = useSelector(getBucks);
    const fuelGauge = useSelector(getFuelGauge);
    const index = useSelector(getProfileIndex);
    const ccProfilingState = useSelector(getCcProfilingState);

    const dispatch = useDispatch();

    useEffect(() => {
        if (profilingStage === 'Charging') {
            const baseDirectory = path.join(
                profile.baseDirectory,
                profile.name,
                `${PROFILE_FOLDER_PREFIX}${index + 1}`
            );

            if (!existsSync(baseDirectory)) {
                mkdirSync(baseDirectory, { recursive: true });
            }

            const debugFolder = path.join(baseDirectory, 'debug');

            if (!existsSync(debugFolder)) {
                mkdirSync(debugFolder, { recursive: true });
            }
            dispatch(setEventRecordingPath(debugFolder));
        } else if (profilingStage === 'Complete') {
            dispatch(setEventRecordingPath(''));
        }
    }, [dispatch, index, profile, profilingStage]);

    useEffect(
        () =>
            npmDevice?.getBatteryProfiler()?.onProfilingEvent(event => {
                dispatch(
                    setLatestTBat(Number.parseFloat(event.data.tBat.toFixed(2)))
                );
                if (event.data.seq === 1 && profilingStage === 'Resting') {
                    dispatch(setProfilingStage('Profiling'));
                    timeOffset.current = event.timestamp;
                } else if (profilingStage === 'Profiling') {
                    const mAhConsumed =
                        (Math.abs(event.data.iLoad) * REPORTING_RATE) / 3600;
                    dispatch(incrementCapacityConsumed(mAhConsumed));

                    const baseDirectory = path.join(
                        profile.baseDirectory,
                        profile.name,
                        `${PROFILE_FOLDER_PREFIX}${index + 1}`
                    );

                    const profilingCsvPath = path.join(
                        baseDirectory,
                        `${profile.name}_${profile.capacity}mAh_T${
                            profile.temperatures[index] < 0 ? 'n' : 'p'
                        }${profile.temperatures[index]}.csv`
                    );

                    const newFile = !existsSync(profilingCsvPath);
                    let data = `${
                        (event.timestamp - timeOffset.current) / 1000
                    },${event.data.iLoad},${event.data.vLoad},${
                        event.data.tBat
                    }\r\n`;
                    if (newFile) {
                        data = `Seconds,Current(A),Voltage(V),Temperature(C)\r\n${data}`;
                        const projectFilePath =
                            generateDefaultProjectPath(profile);

                        dispatch(
                            atomicUpdateProjectSettings(
                                generateDefaultProjectPath(profile),
                                profileSettings => {
                                    profileSettings.profiles[index].csvReady =
                                        false;
                                    profileSettings.profiles[index].csvPath =
                                        path.relative(
                                            projectFilePath,
                                            profilingCsvPath
                                        );
                                    return profileSettings;
                                }
                            )
                        );
                    }

                    appendFile(profilingCsvPath, data, () => {});
                }
            }),
        [dispatch, index, npmDevice, profile, profilingStage]
    );

    useEffect(() => {
        if (profilingStage === 'Resting' || profilingStage === 'Profiling') {
            if (usbPowered) {
                npmDevice?.setAutoRebootDevice(true);
                npmDevice?.getBatteryProfiler()?.stopProfiling();
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: ` Process was interrupted due to USB PMIC connected while ${profilingStage}.`,
                    })
                );
            } else if (fuelGauge) {
                npmDevice?.setAutoRebootDevice(true);
                npmDevice?.getBatteryProfiler()?.stopProfiling();
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: ` Process was interrupted due to Fuel Gauge being turned on while ${profilingStage}.`,
                    })
                );
            } else if (!batteryConnected) {
                npmDevice?.setAutoRebootDevice(true);
                npmDevice?.getBatteryProfiler()?.stopProfiling();
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: ` Process was interrupted due to battery being disconnected while ${profilingStage}.`,
                    })
                );
            } else if (ldos.filter(ldo => ldo.enabled).length > 0) {
                npmDevice?.setAutoRebootDevice(true);
                npmDevice?.getBatteryProfiler()?.stopProfiling();
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: ` Process was interrupted due to LDO being enabled while ${profilingStage}.`,
                    })
                );
            } else if (bucks.length && bucks[0].enabled) {
                npmDevice?.setAutoRebootDevice(true);
                npmDevice?.getBatteryProfiler()?.stopProfiling();
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: ` Process was interrupted due to Buck being enabled while ${profilingStage}.`,
                    })
                );
            }
        }
    }, [
        batteryConnected,
        bucks,
        dispatch,
        fuelGauge,
        ldos,
        npmDevice,
        profilingStage,
        usbPowered,
    ]);

    useEffect(() => {
        switch (ccProfilingState) {
            case 'Ready':
                dispatch(
                    setCompleteStep({
                        message:
                            'Profiling is ready. All profiling cycles complete.',
                        level: 'success',
                    })
                );
                dispatch(markProfilersAsReady());
                break;
            case 'ThermalError':
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message: 'Profiling was stopped due to thermal error.',
                    })
                );
                break;
            case 'vCutOff':
                dispatch(
                    setCompleteStep({
                        level: 'success',
                        message: 'Profiling is ready. vCutOff was reached.',
                    })
                );
                dispatch(markProfilersAsReady());
                break;
            case 'POF':
                dispatch(
                    setCompleteStep({
                        level: 'danger',
                        message:
                            'Profiling POF event occurred before reaching vCutOff.',
                    })
                );
                break;
        }
    }, [ccProfilingState, dispatch]);

    return (
        <>
            {profilingStage === 'MissingSyncBoard' && (
                <PreConfigurationDialog />
            )}
            {profilingStage === 'Configuration' && <ConfigurationDialog />}
            {profilingStage === 'Checklist' && <ChecklistDialog />}
            {profilingStage === 'Charging' && <ChargingDialog />}
            {profilingStage === 'Resting' && <RestingDialog />}
            {profilingStage === 'Profiling' && <ProfilingDialog />}
            {profilingStage === 'Complete' && <CompleteDialog />}
        </>
    );
};
