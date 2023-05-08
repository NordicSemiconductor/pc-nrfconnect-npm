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

import { noop } from '../../features/pmicControl/npm/pmicHelpers';
import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getProfile,
    getProfileIndex,
} from '../../features/pmicControl/profilingSlice';
import { REST_DURATION } from './helpers';
import TimeComponent from './TimeComponent';

export default () => {
    const profile = useSelector(getProfile);
    const index = useSelector(getProfileIndex);
    const npmDevice = useSelector(getNpmDevice);

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
                <div>
                    <strong>Status: </strong>
                    <span>Resting Battery</span>
                </div>

                <TimeComponent
                    time={time}
                    progress={(time / 1000 / REST_DURATION) * 100}
                />
            </Group>
        </GenericDialog>
    );
};
