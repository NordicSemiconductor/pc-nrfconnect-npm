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

import { noop } from '../../features/pmicControl/npm/pmicHelpers';
import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getCapacityConsumed,
    getProfile,
    getProfileIndex,
} from '../../features/pmicControl/profilingSlice';
import TimeComponent from './TimeComponent';

export default () => {
    const profile = useSelector(getProfile);
    const capacityConsumed = useSelector(getCapacityConsumed);
    const index = useSelector(getProfileIndex);

    const { time } = useStopwatch({
        autoStart: true,
        resolution: 1000,
    });

    const npmDevice = useSelector(getNpmDevice);

    const dispatch = useDispatch();

    const averageConsumption = useMemo(() => {
        let l = 0;
        let t = 0;

        profile.profilingProfiles.forEach(profiler => {
            l += profiler.iLoad * 1000; // A to mA;
            t += profiler.tLoad / 1000; // ms to s
            l += profiler.iRest * 1000; // A to mA;
            t += profiler.tLoad / 1000; // ms to s
        });

        const average = l / t;
        const averageMAhConsumed = (Math.abs(average) * 1000 * 1000) / 3600000;
        return averageMAhConsumed;
    }, [profile.profilingProfiles]);

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
                            npmDevice?.getBatteryProfiler()?.stopProfiling();
                            dispatch(closeProfiling());
                            npmDevice?.setAutoRebootDevice(true);
                        }}
                    >
                        Abort
                    </DialogButton>
                </>
            }
        >
            <Group>
                <div>
                    <strong>Status: </strong>
                    <span>{`Profiling. ${capacityConsumed.toFixed(2)}mAh of ${
                        profile.capacity
                    }mAh`}</span>
                </div>
                <TimeComponent
                    time={time}
                    progress={
                        ((averageConsumption * (time / 1000)) /
                            profile.capacity) *
                        100
                    }
                />
            </Group>
        </GenericDialog>
    );
};
