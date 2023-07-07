/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { existsSync, mkdirSync, rmSync } from 'fs';
import path from 'path';
import {
    Alert,
    AppThunk,
    ButtonVariants,
    DialogButton,
    GenericDialog,
    getWaitingForDeviceTimeout,
    Group,
} from 'pc-nrfconnect-shared';

import { RootState } from '../../../appReducer';
import { stringToFile } from '../../../features/helpers';
import {
    mergeBatteryParams,
    startProcessingCsv,
} from '../../../features/nrfutillNpm/csvProcessing';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import {
    getProfileProjects,
    getProjectProfileProgress,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import {
    closeProfiling,
    getCapacityConsumed,
    getCompleteStep,
    getProfile,
    getProfileIndex,
    nextProfile,
    restartProfile,
    setAbortAction,
} from '../../../features/pmicControl/profilingSlice';
import {
    generateDefaultProjectPath,
    PROFILE_FOLDER_PREFIX,
    readAndUpdateProjectSettings,
} from '../helpers';
import StepperProgress from './StepperProgress';

export const markProfilersAsReady = (): AppThunk => (dispatch, getState) => {
    const profile = getState().app.profiling.profile;
    const index = getState().app.profiling.index;

    const fileName = generateDefaultProjectPath(profile);
    dispatch(
        readAndUpdateProjectSettings(fileName, profileSettings => {
            profileSettings.profiles[index].csvReady = true;

            return profileSettings;
        })
    );

    dispatch(startProcessingCsv(profile, index));
};

const finishProfiling = (): AppThunk<RootState> => (dispatch, getState) => {
    const npmDevice = getState().app.pmicControl.npmDevice;

    npmDevice?.setAutoRebootDevice(true);
    npmDevice
        ?.getBatteryProfiler()
        ?.isProfiling()
        .then(result => {
            if (result) {
                npmDevice.getBatteryProfiler()?.stopProfiling();
            }
            dispatch(closeProfiling());
        })
        .catch(() => {
            dispatch(closeProfiling());
        });
};

const FinishButton = ({
    disabled,
    markAsComplete = false,
}: {
    disabled: boolean;
    markAsComplete?: boolean;
}) => {
    const dispatch = useDispatch();

    return (
        <DialogButton
            disabled={disabled}
            variant="secondary"
            onClick={() => {
                if (markAsComplete) {
                    dispatch(markProfilersAsReady());
                }
                dispatch(finishProfiling());
            }}
        >
            Finish
        </DialogButton>
    );
};

const SaveBatteryModelButton = ({
    disabled,
    variant = 'primary',
    onGeneratingBatteryModel,
}: {
    onGeneratingBatteryModel: (value: boolean) => void;
    variant?: ButtonVariants;
    disabled: boolean;
}) => {
    const dispatch = useDispatch();
    const profile = useSelector(getProfile);

    const project = useSelector(getProfileProjects).find(
        p => p.path === generateDefaultProjectPath(profile)
    );

    const finishedProfiles =
        project?.settings?.profiles.filter(
            prof => prof.batteryJson && prof.paramsJson && prof.batteryInc
        ) ?? [];

    return (
        <DialogButton
            variant={variant}
            disabled={finishedProfiles.length === 0 || disabled}
            onClick={() => {
                if (project?.settings) {
                    onGeneratingBatteryModel(true);
                    mergeBatteryParams(project.settings, finishedProfiles)
                        .then(data => {
                            const filePath = path.join(
                                profile.baseDirectory,
                                profile.name,
                                `${profile.name}_${finishedProfiles
                                    .map(p => p.temperature)
                                    .join('_')}C`
                            );
                            stringToFile(`${filePath}.json`, data.json);
                            stringToFile(`${filePath}.inc`, data.inc);
                        })
                        .finally(() => {
                            dispatch(finishProfiling());
                            onGeneratingBatteryModel(false);
                        });
                }
            }}
        >
            Save Battery Model
        </DialogButton>
    );
};

const RestartProfileButton = ({
    variant = 'secondary',
}: {
    variant?: ButtonVariants;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);
    const profile = useSelector(getProfile);
    const index = useSelector(getProfileIndex);
    const progress = useSelector(getProjectProfileProgress);

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
                progress
                    .filter(
                        prog =>
                            prog.path === generateDefaultProjectPath(profile) &&
                            prog.index === index
                    )
                    .forEach(prog => prog.cancel());
                const baseDirector = path.join(
                    profile.baseDirectory,
                    profile.name,
                    `${PROFILE_FOLDER_PREFIX}${index + 1}`
                );

                if (existsSync(baseDirector)) {
                    rmSync(baseDirector, { recursive: true, force: true });
                }

                const filePath = generateDefaultProjectPath(profile);

                dispatch(
                    readAndUpdateProjectSettings(filePath, profileSettings => {
                        profileSettings.profiles[index].csvReady = false;
                        profileSettings.profiles[index].csvPath = undefined;
                        return profileSettings;
                    })
                );

                mkdirSync(baseDirector, { recursive: true });

                npmDevice?.setAutoRebootDevice(true);
                npmDevice
                    ?.getBatteryProfiler()
                    ?.isProfiling()
                    .then(result => {
                        if (result) {
                            npmDevice.getBatteryProfiler()?.stopProfiling();
                        }
                        dispatch(restartProfile());
                    })
                    .catch(() => {
                        dispatch(restartProfile());
                    });
            }}
        >
            Restart Profiling
        </DialogButton>
    );
};

const NextProfileButton = ({
    variant = 'primary',
    markAsComplete = false,
}: {
    variant?: ButtonVariants;
    markAsComplete?: boolean;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
                if (markAsComplete) {
                    dispatch(markProfilersAsReady());
                }
                npmDevice?.setAutoRebootDevice(true);
                npmDevice
                    ?.getBatteryProfiler()
                    ?.isProfiling()
                    .then(result => {
                        if (result) {
                            npmDevice.getBatteryProfiler()?.stopProfiling();
                        }
                        dispatch(nextProfile());
                    })
                    .catch(() => {
                        dispatch(nextProfile());
                    });
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
                dispatch(
                    setAbortAction(() => {
                        npmDevice?.setAutoRebootDevice(true);
                        npmDevice
                            ?.getBatteryProfiler()
                            ?.isProfiling()
                            .then(result => {
                                if (result) {
                                    npmDevice
                                        .getBatteryProfiler()
                                        ?.stopProfiling();
                                }
                                dispatch(closeProfiling());
                            })
                            .catch(() => {
                                dispatch(closeProfiling());
                            });
                    })
                );
            }}
        >
            Abort
        </DialogButton>
    );
};

const CloseProfileButton = () => {
    const dispatch = useDispatch();

    return (
        <DialogButton
            variant="secondary"
            onClick={() => {
                dispatch(closeProfiling());
            }}
        >
            Close
        </DialogButton>
    );
};

export default ({ isVisible }: { isVisible: boolean }) => {
    const [generatingBatteryModel, setGeneratingBatterModel] = useState(false);
    const profile = useSelector(getProfile);
    const completeStep = useSelector(getCompleteStep);
    const index = useSelector(getProfileIndex);
    const capacityConsumed = useSelector(getCapacityConsumed);
    const waitingForDevice = useSelector(getWaitingForDeviceTimeout);

    const profileProgress = useSelector(getProjectProfileProgress).filter(
        p => p.path === generateDefaultProjectPath(profile)
    );

    const allProcessedSuccessfully = profileProgress.length === 0;
    const allAreProcessing =
        profileProgress.length === profile.temperatures.length;

    const lastProfile = index + 1 === profile.temperatures.length;

    return (
        <GenericDialog
            title={`Battery Profiling ${
                profile.name.length > 0 ? `- ${profile.name}` : ''
            } @ ${profile.temperatures[index]}°C`}
            isVisible={isVisible}
            showSpinner={generatingBatteryModel}
            className="app-dialog"
            closeOnEsc={false}
            footer={
                <>
                    {completeStep?.level === 'success' && (
                        <>
                            {lastProfile && (
                                <>
                                    <SaveBatteryModelButton
                                        disabled={generatingBatteryModel}
                                        onGeneratingBatteryModel={
                                            setGeneratingBatterModel
                                        }
                                    />
                                    <FinishButton
                                        disabled={generatingBatteryModel}
                                    />
                                </>
                            )}
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
                            <RestartProfileButton variant="primary" />
                            <AbortProfileButton />
                        </>
                    )}

                    {completeStep?.level === 'warning' && (
                        <>
                            {lastProfile && (
                                <>
                                    <RestartProfileButton variant="primary" />
                                    <SaveBatteryModelButton
                                        variant="secondary"
                                        disabled={generatingBatteryModel}
                                        onGeneratingBatteryModel={
                                            setGeneratingBatterModel
                                        }
                                    />
                                    <FinishButton
                                        markAsComplete
                                        disabled={generatingBatteryModel}
                                    />
                                </>
                            )}
                            {!lastProfile && (
                                <>
                                    <RestartProfileButton variant="primary" />
                                    <NextProfileButton
                                        markAsComplete
                                        variant="secondary"
                                    />
                                    <AbortProfileButton />
                                </>
                            )}
                        </>
                    )}

                    {completeStep?.level === 'terminal' && (
                        <CloseProfileButton />
                    )}
                </>
            }
        >
            <Group>
                {waitingForDevice && (
                    <Alert label="Caution: " variant="warning">
                        Waiting to for device to reconnect...
                    </Alert>
                )}
                {completeStep?.level === 'success' && !lastProfile && (
                    <Alert variant="success" label="Action required: ">
                        {`Profiling  ${profile.temperatures[index]}°C is complete. Click 'Next Profile' to continue.`}
                    </Alert>
                )}
                {(completeStep?.level === 'success' ||
                    completeStep?.level === 'warning') &&
                    lastProfile &&
                    !allProcessedSuccessfully && (
                        <Alert variant="warning" label="Caution: ">
                            {!allAreProcessing &&
                                `Models that failed to, or are still processing, will not be included when saving the battery model. `}
                            {allAreProcessing &&
                                `Not able to save battery model. No battery profiles are available yet. Try reprocess any failed models. `}
                            {`Data will continue to be processed in the background if
                        you click finish. You can continue to work on these
                        profiles from the 'Profiles' tab`}
                        </Alert>
                    )}
                {completeStep?.level !== 'terminal' &&
                    generatingBatteryModel && (
                        <Alert variant="info" label="Note: ">
                            Generating battery model
                        </Alert>
                    )}
                {completeStep?.level === 'terminal' && (
                    <Alert variant="danger" label="Error: ">
                        {completeStep.message}
                    </Alert>
                )}
                <StepperProgress
                    currentProfilingStepOverride={{
                        caption: `Capacity consumed ${(
                            capacityConsumed ?? 0
                        ).toFixed(2)}mAh`,
                    }}
                />
            </Group>
        </GenericDialog>
    );
};
