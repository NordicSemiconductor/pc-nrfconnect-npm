/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appendFile, existsSync, mkdirSync } from 'fs';

import {
    getBucks,
    getFuelGauge,
    getLdos,
    getNpmDevice,
    isBatteryConnected,
    isUsbPowered,
    setEventRecordingPath,
} from '../../features/pmicControl/pmicControlSlice';
import {
    getCcProfilingState,
    getProfile,
    getProfileIndex,
    getProfilingStage,
    incrementCapacityConsumed,
    setCompleteStep,
    setProfilingStage,
} from '../../features/pmicControl/profilingSlice';
import ChargingDialog from './ChargingDialog';
import ChecklistDialog from './ChecklistDialog';
import CompleteDialog from './CompleteDialog';
import ConfigurationDialog from './ConfigurationDialog';
import { REPORTING_RATE } from './helpers';
import ProfilingDialog from './ProfilingDialog';
import RestingDialog from './RestingDialog';

const PROFILE_FOLDER_PREFIX = 'profile_';

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
        if (profilingStage === 'Checklist') {
            const baseDirector = `${
                profile.baseDirector
            }/${PROFILE_FOLDER_PREFIX}${index + 1}/`;

            if (!existsSync(baseDirector)) {
                mkdirSync(baseDirector);
            }

            const debugFolder = `${baseDirector}/debug/`;

            if (!existsSync(debugFolder)) {
                mkdirSync(debugFolder);
            }
            dispatch(setEventRecordingPath(debugFolder));
        }
    }, [dispatch, index, profile.baseDirector, profilingStage]);

    useEffect(
        () =>
            npmDevice?.getBatteryProfiler()?.onProfilingEvent(event => {
                if (event.data.seq === 1 && profilingStage === 'Resting') {
                    dispatch(setProfilingStage('Profiling'));
                    const mAhConsumed =
                        (Math.abs(event.data.iLoad) * 1000 * REPORTING_RATE) /
                        3600000;
                    dispatch(incrementCapacityConsumed(mAhConsumed));
                    timeOffset.current = event.timestamp;
                } else if (profilingStage === 'Profiling') {
                    const baseDirector = `${
                        profile.baseDirector
                    }/${PROFILE_FOLDER_PREFIX}${index + 1}`;

                    const path = `${baseDirector}/${profile.capacity}mAh_T${
                        profile.temperatures[index] < 0 ? 'n' : 'p'
                    }${profile.temperatures[index]}.csv`;

                    const addHeaders = !existsSync(path);
                    let data = `${
                        (event.timestamp - timeOffset.current) / 1000
                    },${event.data.iLoad},${event.data.vLoad},${
                        event.data.tBat
                    }\r\n`;
                    if (addHeaders) {
                        data = `Seconds,Current(A),Voltage(V),Temperature(C)\r\n${data}`;
                    }

                    appendFile(path, data, () => {});
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
                break;
            case 'POF':
                dispatch(
                    setCompleteStep({
                        level: 'warning',
                        message:
                            'Profiling POF event occurred before reaching vCutOff.',
                    })
                );
                break;
        }
    }, [ccProfilingState, dispatch, npmDevice]);

    return (
        <>
            {profilingStage === 'Configuration' && <ConfigurationDialog />}
            {profilingStage === 'Checklist' && <ChecklistDialog />}
            {profilingStage === 'Charging' && <ChargingDialog />}
            {profilingStage === 'Resting' && <RestingDialog />}
            {profilingStage === 'Profiling' && <ProfilingDialog />}
            {profilingStage === 'Complete' && <CompleteDialog />}
        </>
    );
};
