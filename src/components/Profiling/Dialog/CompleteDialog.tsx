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
    ButtonVariants,
    DialogButton,
    GenericDialog,
    Group,
} from 'pc-nrfconnect-shared';

import { showSaveDialog } from '../../../actions/fileActions';
import { RootState } from '../../../appReducer';
import { stringToFile } from '../../../features/helpers';
import { mergeBatteryParams } from '../../../features/nrfutillNpm/csvProcessing';
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
} from '../../../features/pmicControl/profilingSlice';
import { TDispatch } from '../../../thunk';
import {
    atomicUpdateProjectSettings,
    generateDefaultProjectPath,
    PROFILE_FOLDER_PREFIX,
} from '../helpers';
import StepperProgress from './StepperProgress';

const finishProfiling =
    () => (dispatch: TDispatch, getState: () => RootState) => {
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

const FinishButton = ({ disabled }: { disabled: boolean }) => {
    const dispatch = useDispatch();

    return (
        <DialogButton
            disabled={disabled}
            variant="secondary"
            onClick={() => {
                dispatch(finishProfiling());
            }}
        >
            Finish
        </DialogButton>
    );
};

const SaveBatteryModelButton = ({
    disabled,
    onGeneratingBatteryModel,
}: {
    onGeneratingBatteryModel: (value: boolean) => void;
    disabled: boolean;
}) => {
    const dispatch = useDispatch();
    const profile = useSelector(getProfile);

    const project = useSelector(getProfileProjects).find(
        p => p.path === generateDefaultProjectPath(profile)
    );

    const finishedProfiles =
        project?.settings?.profiles.filter(
            prof => prof.batteryJson && prof.paramsJson
        ) ?? [];

    return (
        <DialogButton
            variant="primary"
            disabled={finishedProfiles.length === 0 || disabled}
            onClick={() => {
                showSaveDialog({
                    title: 'Battery Profile',
                    defaultPath: `${profile.name}_${finishedProfiles
                        .map(p => p.temperature)
                        .join('_')}C)}.json`,
                    filters: [
                        {
                            name: 'JSON',
                            extensions: ['json'],
                        },
                    ],
                }).then(result => {
                    if (
                        project?.settings &&
                        !result.canceled &&
                        result.filePath
                    ) {
                        onGeneratingBatteryModel(true);
                        mergeBatteryParams(project.settings, finishedProfiles)
                            .then(data => {
                                if (result.filePath)
                                    stringToFile(result.filePath, data);
                            })
                            .finally(() => {
                                dispatch(finishProfiling());
                                onGeneratingBatteryModel(false);
                            });
                    }
                });
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

    return (
        <DialogButton
            variant={variant}
            onClick={() => {
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
                    atomicUpdateProjectSettings(filePath, profileSettings => {
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
            }}
        >
            Abort
        </DialogButton>
    );
};

export default () => {
    const [generatingBatteryModel, setGeneratingBatterModel] = useState(false);
    const profile = useSelector(getProfile);
    const completeStep = useSelector(getCompleteStep);
    const index = useSelector(getProfileIndex);
    const capacityConsumed = useSelector(getCapacityConsumed);

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
            } @ ${profile.temperatures[index]} °C`}
            isVisible
            showSpinner={generatingBatteryModel}
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
                </>
            }
        >
            <Group>
                {lastProfile && !allProcessedSuccessfully && (
                    <Alert variant="warning" label="Warning: ">
                        {!allAreProcessing &&
                            `Models that failed to, or are still processing, will not be included when saving the battery model. `}
                        {allAreProcessing &&
                            `Not able to save battery model. No battery profiles are available yet. Try reprocess any failed models. `}
                        {`Data will continue to be processed in the background if
                        you click finish. You can continue to work on theses
                        profiles from the 'Profiles' tab`}
                    </Alert>
                )}
                {generatingBatteryModel && (
                    <Alert variant="info" label="Info: ">
                        Generating battery model
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
