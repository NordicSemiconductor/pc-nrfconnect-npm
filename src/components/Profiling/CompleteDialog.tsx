/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    ButtonVariants,
    DialogButton,
    GenericDialog,
    Group,
} from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import {
    closeProfiling,
    getCapacityConsumed,
    getCompleteStep,
    getProfile,
    getProfileIndex,
    getProfileStartTime,
    nextProfile,
    restartProfile,
} from '../../features/pmicControl/profilingSlice';
import { ElapsedTime } from './TimeComponent';

const FinishButton = ({
    variant = 'primary',
}: {
    variant?: ButtonVariants;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
                npmDevice?.setAutoRebootDevice(true);
                dispatch(closeProfiling());
            }}
        >
            Finish
        </DialogButton>
    );
};

const RestartProfileButton = ({
    variant = 'primary',
}: {
    variant?: ButtonVariants;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
                npmDevice?.setAutoRebootDevice(true);
                dispatch(restartProfile());
            }}
        >
            Restart Profile
        </DialogButton>
    );
};

const NextProfileButton = ({
    variant = 'primary',
}: {
    variant?: ButtonVariants;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
                npmDevice?.setAutoRebootDevice(true);
                dispatch(nextProfile());
            }}
        >
            Next Profile
        </DialogButton>
    );
};

const AbortProfileButton = () => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    return (
        <DialogButton
            variant="secondary"
            onClick={() => {
                npmDevice?.setAutoRebootDevice(true);
                dispatch(closeProfiling());
            }}
        >
            Abort
        </DialogButton>
    );
};

export default () => {
    const profile = useSelector(getProfile);
    const completeStep = useSelector(getCompleteStep);
    const index = useSelector(getProfileIndex);
    const startTime = useSelector(getProfileStartTime);
    const capacityConsumed = useSelector(getCapacityConsumed);
    const totalTime = useRef(Date.now() - startTime);

    const lastProfile = index + 1 === profile.temperatures.length;

    const label = useMemo(() => {
        switch (completeStep?.level) {
            case 'success':
                return 'Success ';
            case 'danger':
                return 'Error ';
            case 'warning':
                return 'Warning ';
        }
    }, [completeStep]);

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            closeOnEsc={false}
            footer={
                <>
                    {completeStep?.level === 'success' && (
                        <>
                            {lastProfile && <FinishButton />}
                            {!lastProfile && (
                                <>
                                    <NextProfileButton />
                                    <AbortProfileButton />
                                </>
                            )}
                        </>
                    )}

                    {completeStep?.level === 'danger' && (
                        <>
                            <RestartProfileButton />
                            <AbortProfileButton />
                        </>
                    )}

                    {completeStep?.level === 'warning' && (
                        <>
                            {lastProfile && (
                                <>
                                    <FinishButton />
                                    <RestartProfileButton variant="secondary" />
                                </>
                            )}
                            {!lastProfile && (
                                <>
                                    <NextProfileButton />
                                    <RestartProfileButton variant="secondary" />
                                    <AbortProfileButton />
                                </>
                            )}
                        </>
                    )}
                </>
            }
        >
            <Group>
                <Alert label={label} variant={completeStep?.level ?? 'success'}>
                    {completeStep?.message ?? ''}
                </Alert>
                <div>
                    <strong>Status: </strong>
                    <span>{`Results for profile at temperature ${
                        profile.temperatures[index]
                    }°C. Capacity consumed ${(capacityConsumed ?? 0).toFixed(
                        2
                    )}mAh`}</span>
                </div>

                <ElapsedTime time={totalTime.current} />
            </Group>
        </GenericDialog>
    );
};