/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo } from 'react';
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
    getCapacityConsumed,
    getLatestTBat,
    getLatestVLoad,
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
    const profile = useSelector(getProfile);
    const capacityConsumed = useSelector(getCapacityConsumed);
    const index = useSelector(getProfileIndex);
    const latestTBat = useSelector(getLatestTBat);
    const latestVLoad = useSelector(getLatestVLoad);

    const { time } = useStopwatch({
        autoStart: true,
        resolution: 1000,
    });

    const npmDevice = useSelector(getNpmDevice);

    const dispatch = useDispatch();

    const progress = useMemo(() => {
        let average = 0;
        let lastCutOff = profile.vUpperCutOff;
        const deltaCutOff = profile.vUpperCutOff - profile.vLowerCutOff;

        profile.profilingProfiles.forEach(profiler => {
            if (profiler.iLoad !== 0) {
                // skip first 2 profile as these is the Profiling Rest of 5 min

                let l = 0;
                let t = 0;

                l += profiler.iLoad * profiler.tLoad; // A to mA;
                t += profiler.tLoad / 1000; // ms to s
                l += profiler.iRest * profiler.tRest; // A to mA;
                t += profiler.tRest / 1000; // ms to s

                average +=
                    (l / t) *
                    ((lastCutOff - (profiler.vCutoff ?? profile.vLowerCutOff)) /
                        deltaCutOff);
                lastCutOff = profiler.vCutoff ?? profile.vLowerCutOff;
            }
        });

        const averageConsumptionMillAmpHr = Math.abs(average) / 3600;
        const theoreticalProgressMillAmpHr =
            (averageConsumptionMillAmpHr * (time / 1000)) / profile.capacity;
        const actualProgressMillAmpHr = capacityConsumed / profile.capacity;

        const alpha = 1 - actualProgressMillAmpHr;

        const vDelta = Math.min(
            profile.vUpperCutOff - (latestVLoad ?? profile.vLowerCutOff),
            0
        );
        const maxVDelta = profile.vUpperCutOff - profile.vLowerCutOff;
        const voltageProgress = Math.min((vDelta / maxVDelta) * 100, 100);

        const millAmpHrProgress = Math.min(
            (theoreticalProgressMillAmpHr * alpha +
                actualProgressMillAmpHr * actualProgressMillAmpHr) *
                100,
            100
        );

        return voltageProgress * 0.05 + millAmpHrProgress * 0.95;
    }, [capacityConsumed, latestVLoad, profile, time]);

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]}°C`}
            isVisible={isVisible}
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
                                    npmDevice
                                        ?.getBatteryProfiler()
                                        ?.stopProfiling();
                                    dispatch(closeProfiling());
                                    npmDevice?.setAutoRebootDevice(true);
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
                <RestingProfilingAlerts />
                <ProfilingTemperatureAlert
                    showOnWarning
                    currentTemperature={latestTBat}
                    expectedTemperature={profile.temperatures[index]}
                />
                <StepperProgress
                    currentProfilingStepOverride={{
                        caption: `Profiling. ${capacityConsumed.toFixed(
                            2
                        )} mAh of ${profile.capacity} mAh`,
                    }}
                />
                <TimeComponent time={time} progress={progress} />
            </Group>
        </GenericDialog>
    );
};
