/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    clearWaitForDevice,
    DialogButton,
    GenericDialog,
    useStopwatch,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { noop } from '../../../features/pmicControl/npm/pmicHelpers';
import {
    getCharger,
    getNpmDevice,
} from '../../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getLatestTBat,
    getProfile,
    getProfileIndex,
    setAbortAction,
} from '../../../features/pmicControl/profilingSlice';
import TimeComponent from '../TimeComponent';
import {
    ProfilingTemperatureAlert,
    RestingProfilingAlerts,
} from './CommonAlerts';
import StepperProgress from './StepperProgress';

export default ({ isVisible }: { isVisible: boolean }) => {
    const charger = useSelector(getCharger);
    const profile = useSelector(getProfile);
    const index = useSelector(getProfileIndex);
    const npmDevice = useSelector(getNpmDevice);
    const latestTBat = useSelector(getLatestTBat);

    const { time } = useStopwatch({
        autoStart: true,
        resolution: 1000,
    });

    const dispatch = useDispatch();

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]}°C${
                charger?.ntcThermistor !== 'Ignore NTC'
                    ? ` - NTC ${latestTBat}°C`
                    : ''
            }`}
            isVisible={isVisible}
            className="app-dialog"
            showSpinner
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton variant="primary" disabled onClick={noop}>
                        Continue
                    </DialogButton>

                    <DialogButton
                        onClick={() => {
                            dispatch(
                                setAbortAction(() => {
                                    npmDevice?.batteryProfiler?.stopProfiling();
                                    npmDevice?.setAutoRebootDevice(true);
                                    dispatch(closeProfiling());
                                    dispatch(clearWaitForDevice());
                                }),
                            );
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <div className="tw-flex tw-flex-col tw-gap-2">
                <RestingProfilingAlerts />
                <ProfilingTemperatureAlert
                    ntcThermistor={profile.ntcThermistor}
                    showOnWarning
                    currentTemperature={latestTBat}
                    expectedTemperature={profile.temperatures[index]}
                />
                <StepperProgress
                    currentProfilingStepOverride={{
                        caption: 'Resting Battery',
                    }}
                />
                <TimeComponent
                    time={time}
                    progress={
                        (time /
                            1000 /
                            profile.restingProfiles.reduce(
                                (acc, curr) => acc + curr.cycles,
                                0,
                            )) *
                        100
                    }
                />
            </div>
        </GenericDialog>
    );
};
