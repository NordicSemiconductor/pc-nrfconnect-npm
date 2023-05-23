/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OpenDialogReturnValue } from 'electron';
import fs from 'fs';
import path from 'path';
import { Alert, Button, Card, PaneProps, Toggle } from 'pc-nrfconnect-shared';

import { showOpenDialog } from '../../../actions/fileActions';
import {
    ProfilingProject,
    ProfilingProjectProfile,
} from '../../../features/pmicControl/npm/types';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { getProfileProjects } from '../../../features/pmicControl/profilingSlice';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import {
    addRecentProject,
    readProjectSettingsFromFile,
    reloadRecentProjects,
    removeRecentProject,
    updateProjectSettings,
} from '../helpers';

import './profilingProjects.scss';

type projectPathPair = {
    path: string;
    settings: ProfilingProject | undefined;
};

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

    return (
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
                            const projectSettings =
                                readProjectSettingsFromFile(
                                    projectSettingsPath
                                );
                            if (!projectSettings) {
                                return;
                            }

                            projectSettings.profiles[index].exclude = value;
                            dispatch(
                                updateProjectSettings(
                                    projectSettingsPath,
                                    projectSettings
                                )
                            );
                        }}
                        isToggled={!!profile.exclude || !complete}
                        disabled={!complete}
                    />
                </div>
                <div className="mt-2">
                    <Button
                        onClick={() => {}}
                        variant="secondary"
                        disabled={
                            !isProfileReadyForProcessing(
                                projectSettingsPath,
                                profile
                            )
                        }
                    >
                        Process CSV
                    </Button>
                    <Button
                        onClick={() => {}}
                        variant="secondary"
                        disabled={
                            profile.paramsJson === undefined ||
                            !isProfileReadyForProcessing(
                                projectSettingsPath,
                                profile
                            )
                        }
                    >
                        Export battery model
                    </Button>
                    <Button
                        onClick={() => {}}
                        variant="secondary"
                        disabled={
                            uiDisabled ||
                            pmicConnection === 'ek-disconnected' ||
                            !isProfileReadyForProcessing(
                                projectSettingsPath,
                                profile
                            )
                        }
                    >
                        Load battery model
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MissingProjectSettings = ({ project }: { project: projectPathPair }) => (
    <>
        <div className="d-flex justify-content-between">
            <div>
                <span>{project.path}</span>
            </div>
            <div className="d-flex justify-content-between">
                <div>
                    <Button onClick={() => {}} variant="secondary" disabled>
                        Export battery model
                    </Button>
                    <Button onClick={() => {}} variant="secondary" disabled>
                        Load battery model
                    </Button>
                    <RemoveButton projectSettingsPath={project.path} />
                </div>
            </div>
        </div>
        <Alert label="Error " variant="danger">
            Project settings could not be found
        </Alert>
    </>
);

const MissingProjectSettingsCard = ({
    project,
}: {
    project: projectPathPair;
}) => (
    <Card
        title={
            <div className="d-flex justify-content-between">
                <div>
                    <span>{project.path}</span>
                </div>
                <div>
                    <Button onClick={() => {}} variant="secondary" disabled>
                        Export battery model
                    </Button>
                    <Button onClick={() => {}} variant="secondary" disabled>
                        Load battery model
                    </Button>
                    <RemoveButton projectSettingsPath={project.path} />
                </div>
            </div>
        }
    >
        <MissingProjectSettings project={project} />
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
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();
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
                            onClick={() => {}}
                            variant="secondary"
                            disabled={
                                settings.profiles.length === 0 ||
                                settings.profiles.filter(
                                    profile =>
                                        !isProfileReadyForProcessing(
                                            projectSettingsPath,
                                            profile
                                        )
                                ).length > 0
                            }
                        >
                            Process All CSV
                        </Button>
                        <Button
                            onClick={() => {}}
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
                            onClick={() => {}}
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
        </Card>
    );
};

export default ({ active }: PaneProps) => {
    const dispatch = useDispatch();
    const profiles = useSelector(getProfileProjects);

    useEffect(() => {
        if (active) {
            dispatch(reloadRecentProjects());
        }
    }, [active, dispatch]);

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
                            {!project.settings && (
                                <MissingProjectSettingsCard project={project} />
                            )}
                            {project.settings && (
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
