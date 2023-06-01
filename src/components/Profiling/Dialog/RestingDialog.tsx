/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    DialogButton,
    GenericDialog,
    Group,
    useStopwatch,
} from 'pc-nrfconnect-shared';

import { noop } from '../../../features/pmicControl/npm/pmicHelpers';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getLatestTBat,
    getProfile,
    getProfileIndex,
} from '../../../features/pmicControl/profilingSlice';
import { REST_DURATION } from '../helpers';
import TimeComponent from '../TimeComponent';
import {
    ProfilingTemperatureAlert,
    RestingProfilingAlerts,
} from './CommonAlerts';
import StepperProgress from './StepperProgress';

export default () => {
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
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            showSpinner
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton variant="primary" disabled onClick={noop}>
                        Continue
                    </DialogButton>

                    <DialogButton
                        onClick={() => {
                            npmDevice?.setAutoRebootDevice(true);
                            npmDevice?.getBatteryProfiler()?.stopProfiling();
                            dispatch(closeProfiling());
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <Group>
                <RestingProfilingAlerts />
                <ProfilingTemperatureAlert
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
                    progress={(time / 1000 / REST_DURATION) * 100}
                />
            </Group>
        </GenericDialog>
    );
};
