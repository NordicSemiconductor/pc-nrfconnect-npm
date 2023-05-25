/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { OpenDialogReturnValue } from 'electron';
import fs from 'fs';
import path from 'path';
import {
    Alert,
    Button,
    Card,
    GenericDialog,
    Toggle,
} from 'pc-nrfconnect-shared';

import { showOpenDialog, showSaveDialog } from '../../../actions/fileActions';
import { stringToFile } from '../../../features/helpers';
import {
    generateParamsFromCSV,
    mergeBatteryParams,
} from '../../../features/nrfutillNpm/csvProcessing';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import {
    getProfileProjects,
    getProjectProfileProgress,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import {
    addRecentProject,
    atomicUpdateProjectSettings,
    reloadRecentProjects,
    removeRecentProject,
} from '../helpers';
import {
    ProfilingProject,
    ProfilingProjectProfile,
    ProjectPathPair,
} from '../types';
import { useProfilingProjects } from './useProfilingProjects';

import './profilingProjects.scss';

const isProfileReadyForProcessing = (
    projectSettingsPath: string,
    profile: ProfilingProjectProfile
) =>
    !(
        !profile.csvPath ||
        !profile.csvReady ||
        !fs.existsSync(path.resolve(projectSettingsPath, profile.csvPath))
    );

const RemoveButton = ({
    projectSettingsPath,
}: {
    projectSettingsPath: string;
}) => {
    const dispatch = useDispatch();
    return (
        <Button
            onClick={() => dispatch(removeRecentProject(projectSettingsPath))}
            variant="secondary"
        >
            Remove
        </Button>
    );
};

const ProfileComponent = ({
    projectSettingsPath,
    project,
    index,
}: {
    projectSettingsPath: string;
    project: ProfilingProject;
    index: number;
}) => {
    const dispatch = useDispatch();
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

    const profile = project.profiles[index];

    const complete = !!profile.csvPath && profile.csvReady;
    const csvReadyExists =
        !!profile.csvPath &&
        fs.existsSync(path.resolve(projectSettingsPath, profile.csvPath));
    const progress = useSelector(getProjectProfileProgress).find(
        prog => prog.path === projectSettingsPath && prog.index === index
    );

    return (
        <div className="profile pb-2">
            <div className="d-flex flex-row justify-content-between mt-2 mb-2">
                <div className="flex-grow-1 mr-4">
                    {!complete ? (
                        <Alert variant="info">
                            <strong>Profile is incomplete.</strong>
                            <span>{` Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V.`}</span>
                        </Alert>
                    ) : (
                        <div className="mb-2">
                            <strong>Profile</strong>
                            <span>{` - Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V`}</span>
                        </div>
                    )}

                    {complete && !csvReadyExists && (
                        <Alert variant="danger" label="Error ">
                            {`File ${path.resolve(
                                projectSettingsPath,
                                profile?.csvPath ?? ''
                            )} no longer exists!`}
                        </Alert>
                    )}
                </div>
                <div className="d-flex flex-column justify-content-between  align-items-end float-right">
                    <div>
                        <Toggle
                            label="Exclude"
                            onToggle={value => {
                                dispatch(
                                    atomicUpdateProjectSettings(
                                        projectSettingsPath,
                                        projectSettings => {
                                            if (projectSettings)
                                                projectSettings.profiles[
                                                    index
                                                ].exclude = value;

                                            return projectSettings;
                                        }
                                    )
                                );
                            }}
                            isToggled={!!profile.exclude || !complete}
                            disabled={!complete}
                        />
                    </div>
                    <div className="mt-2">
                        <Button
                            onClick={() => {
                                dispatch(
                                    generateParamsFromCSV(
                                        projectSettingsPath,
                                        index
                                    )
                                );
                            }}
                            variant="secondary"
                            disabled={
                                !!progress ||
                                !isProfileReadyForProcessing(
                                    projectSettingsPath,
                                    profile
                                )
                            }
                        >
                            Process CSV
                        </Button>
                        <Button
                            onClick={() => {
                                showSaveDialog({
                                    title: 'Battery Profile',
                                    filters: [
                                        {
                                            name: 'JSON',
                                            extensions: ['json'],
                                        },
                                    ],
                                }).then(result => {
                                    if (
                                        !result.canceled &&
                                        result.filePath &&
                                        profile.batteryJson
                                    ) {
                                        stringToFile(
                                            result.filePath,
                                            profile.batteryJson
                                        );
                                    }
                                });
                            }}
                            variant="secondary"
                            disabled={profile.batteryJson === undefined}
                        >
                            Export battery model
                        </Button>
                        <Button
                            onClick={() => {
                                if (profile.batteryJson) {
                                    npmDevice?.downloadFuelGaugeProfile(
                                        Buffer.from(profile.batteryJson)
                                    );
                                }
                            }}
                            variant="secondary"
                            disabled={
                                uiDisabled ||
                                pmicConnection === 'ek-disconnected' ||
                                profile.batteryJson === undefined
                            }
                        >
                            Load battery model
                        </Button>
                    </div>
                </div>
            </div>
            {progress && (
                <div className="mt-2 mb-2">
                    <div>{progress.message}</div>
                    <ProgressBar
                        now={progress.progress}
                        style={{ height: '4px' }}
                    />
                </div>
            )}
        </div>
    );
};

const MissingProjectSettingsCard = ({
    project,
}: {
    project: ProjectPathPair;
}) => (
    <Card
        title={
            <div className="d-flex justify-content-between">
                <div>
                    <span>{project.path}</span>
                </div>
                <div>
                    <RemoveButton projectSettingsPath={project.path} />
                </div>
            </div>
        }
    >
        {project.settings === 'fileMissing' && (
            <Alert label="Error " variant="danger">
                Project settings could not be found
            </Alert>
        )}
        {project.settings === 'fileCorrupted' && (
            <Alert label="Error " variant="danger">
                Project settings are corrupt or not valid format
            </Alert>
        )}
    </Card>
);

const ProjectSettings = ({
    projectSettingsPath,
    settings,
}: {
    projectSettingsPath: string;
    settings: ProfilingProject;
}) => (
    <>
        {settings.profiles.length === 0 && (
            <Alert variant="info" label="Info ">
                This profiles does not have any data
            </Alert>
        )}
        {settings.profiles.length > 0 && (
            <div className="d-flex flex-column justify-content-between">
                {settings.profiles.map((profile, index) => (
                    <ProfileComponent
                        key={`${settings.name}${profile.temperature}${
                            index + 1
                        }`}
                        projectSettingsPath={projectSettingsPath}
                        project={settings}
                        index={index}
                    />
                ))}
            </div>
        )}
    </>
);

const ProjectSettingsCard = ({
    projectSettingsPath,
    settings,
}: {
    projectSettingsPath: string;
    settings: ProfilingProject;
}) => {
    const dispatch = useDispatch();
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();
    const allProgress = useSelector(getProjectProfileProgress).filter(
        prog => prog.path === projectSettingsPath
    );
    const [generatingBatterModel, setGeneratingBatterModel] = useState(false);
    const notExcludedProfiles = settings.profiles.filter(
        profile => !profile.exclude
    );

    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <div>
                        <span>
                            <span>{`${settings.name} - Capacity ${settings.capacity} - `}</span>
                        </span>
                        <span>{projectSettingsPath}</span>
                    </div>
                    <div>
                        <Button
                            onClick={() => {
                                settings.profiles.forEach((setting, index) => {
                                    if (
                                        !setting.exclude &&
                                        allProgress.findIndex(
                                            progress => progress.index === index
                                        ) === -1
                                    ) {
                                        dispatch(
                                            generateParamsFromCSV(
                                                projectSettingsPath,
                                                index
                                            )
                                        );
                                    }
                                });
                            }}
                            variant="secondary"
                            disabled={
                                settings.profiles.length === 0 ||
                                notExcludedProfiles.length === 0 ||
                                allProgress.filter(
                                    progress =>
                                        !settings.profiles[progress.index]
                                            .exclude
                                ).length ===
                                    settings.profiles.filter(
                                        profile => !profile.exclude
                                    ).length ||
                                settings.profiles.filter(profile =>
                                    isProfileReadyForProcessing(
                                        projectSettingsPath,
                                        profile
                                    )
                                ).length === 0
                            }
                        >
                            Process all CSVs
                        </Button>
                        <Button
                            onClick={() => {
                                showSaveDialog({
                                    title: 'Battery Profile',
                                    filters: [
                                        {
                                            name: 'JSON',
                                            extensions: ['json'],
                                        },
                                    ],
                                }).then(result => {
                                    setGeneratingBatterModel(true);
                                    if (!result.canceled && result.filePath) {
                                        mergeBatteryParams(
                                            settings,
                                            .then(data => {
                                                if (result.filePath)
                                                    stringToFile(
                                                        result.filePath,
                                                        data
                                                    );
                                            })
                                            .finally(() =>
                                                setGeneratingBatterModel(false)
                                            );
                                    }
                                });
                            }}
                            variant="secondary"
                            disabled={
                                settings.profiles.length === 0 ||
                                settings.profiles.filter(
                                    profile =>
                                        profile.paramsJson === undefined ||
                                        !isProfileReadyForProcessing(
                                            projectSettingsPath,
                                            profile
                                        )
                                ).length > 0
                            }
                        >
                            Export battery model
                        </Button>
                        <Button
                            onClick={() => {
                                setGeneratingBatterModel(true);
                                mergeBatteryParams(
                                    settings,
                                    .then(data =>
                                        npmDevice?.downloadFuelGaugeProfile(
                                            Buffer.from(data)
                                        )
                                    )
                                    .finally(() =>
                                        setGeneratingBatterModel(false)
                                    );
                            }}
                            variant="secondary"
                            disabled={
                                uiDisabled ||
                                pmicConnection === 'ek-disconnected' ||
                                settings.profiles.length === 0 ||
                                settings.profiles.filter(
                                    profile =>
                                        profile.paramsJson === undefined ||
                                        !isProfileReadyForProcessing(
                                            projectSettingsPath,
                                            profile
                                        )
                                ).length > 0
                            }
                        >
                            Load battery model
                        </Button>
                        <RemoveButton
                            projectSettingsPath={projectSettingsPath}
                        />
                    </div>
                </div>
            }
        >
            <ProjectSettings
                projectSettingsPath={projectSettingsPath}
                settings={settings}
            />
            <GenericDialog
                title="Battery Model"
                onHide={() => {}}
                showSpinner
                isVisible={generatingBatterModel}
                footer={null}
            >
                Generating battery model...
            </GenericDialog>
        </Card>
    );
};

export default () => {
    const dispatch = useDispatch();
    const profiles = useSelector(getProfileProjects);

    useProfilingProjects();

    return (
        <div className="profiles-container">
            <div>
                <Button
                    onClick={() => dispatch(reloadRecentProjects())}
                    variant="secondary"
                >
                    Reload
                </Button>
                <Button
                    onClick={() => {
                        showOpenDialog({
                            title: 'Select a JSON file',
                            filters: [
                                {
                                    name: 'JSON',
                                    extensions: ['json'],
                                },
                            ],
                            properties: ['openFile'],
                        }).then(({ filePaths }: OpenDialogReturnValue) => {
                            if (filePaths.length === 1) {
                                dispatch(addRecentProject(filePaths[0]));
                            }
                        });
                    }}
                    variant="secondary"
                >
                    Add Existing Profile
                </Button>
                <div className="d-flex flex-column-reverse">
                    {profiles.map(project => (
                        <React.Fragment key={project.path}>
                            {project.settings === 'fileMissing' ||
                                (project.settings === 'fileCorrupted' && (
                                    <MissingProjectSettingsCard
                                        project={project}
                                    />
                                ))}
                            {typeof project.settings === 'object' && (
                                <ProjectSettingsCard
                                    projectSettingsPath={project.path}
                                    settings={project.settings}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};
