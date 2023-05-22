/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fs from 'fs';
import { Alert, Button, Card, PaneProps, Toggle } from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { getProfileProjects } from '../../../features/pmicControl/profilingSlice';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import { reloadRecentProjects, removeRecentProject } from '../helpers';

import './profilingProjects.scss';

export default ({ active }: PaneProps) => {
    const dispatch = useDispatch();
    const profiles = useSelector(getProfileProjects);
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();

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
                <Button onClick={() => {}} variant="secondary">
                    Add Existing Profile
                </Button>
                {profiles.map(project => (
                    <Card
                        key={project.path}
                        title={
                            <div className="d-flex justify-content-between">
                                <div>
                                    {project.settings ? (
                                        <span>
                                            <span>{`${project.settings.name} - Capacity ${project.settings.capacity} - `}</span>
                                        </span>
                                    ) : null}
                                    <span>{project.path}</span>
                                </div>
                                <div>
                                    <Button
                                        onClick={() => {}}
                                        variant="secondary"
                                        disabled={
                                            !project.settings ||
                                            project.settings.profiles.length ===
                                                0 ||
                                            project.settings.profiles.filter(
                                                profile =>
                                                    profile.paramsJson ===
                                                        undefined ||
                                                    !profile.csvReady ||
                                                    !profile.csvPath ||
                                                    !fs.existsSync(
                                                        profile.csvPath
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
                                            pmicConnection ===
                                                'ek-disconnected' ||
                                            !project.settings ||
                                            project.settings.profiles.length ===
                                                0 ||
                                            project.settings.profiles.filter(
                                                profile =>
                                                    profile.paramsJson ===
                                                        undefined ||
                                                    !profile.csvReady ||
                                                    !profile.csvPath ||
                                                    !fs.existsSync(
                                                        profile.csvPath
                                                    )
                                            ).length > 0
                                        }
                                    >
                                        Load battery model
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            dispatch(
                                                removeRecentProject(
                                                    project.path
                                                )
                                            )
                                        }
                                        variant="secondary"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        }
                    >
                        {project.settings === undefined ? (
                            <Alert label="Error " variant="danger">
                                Project settings could not be found
                            </Alert>
                        ) : (
                            <div className="d-flex flex-column justify-content-between">
                                {project.settings.profiles.map(profile => (
                                    <div
                                        className="d-flex flex-row justify-content-between mt-2 mb-2"
                                        key={`${project.settings?.name ?? ''}${
                                            profile.temperature
                                        }`}
                                    >
                                        <div className="flex-grow-1 mr-4">
                                            <div className="mb-2">
                                                <strong>Profile</strong>
                                                <span>{` - Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V`}</span>
                                            </div>
                                            {!profile.csvPath && (
                                                <Alert
                                                    variant="info"
                                                    label="Info "
                                                >
                                                    CSV data is not available.
                                                    Profiling might still be
                                                    ongoing
                                                </Alert>
                                            )}
                                            {profile.csvPath &&
                                                !fs.existsSync(
                                                    profile.csvPath
                                                ) && (
                                                    <Alert
                                                        variant="danger"
                                                        label="Error "
                                                    >
                                                        {`File ${profile.csvPath} no longer exists!`}
                                                    </Alert>
                                                )}
                                        </div>
                                        <div className="d-flex flex-column justify-content-between  align-items-end float-right">
                                            <div>
                                                <Toggle
                                                    label="Exclude"
                                                    onToggle={() => {}}
                                                    isToggled={false}
                                                />
                                            </div>
                                            <div className="mt-2">
                                                <Button
                                                    onClick={() => {}}
                                                    variant="secondary"
                                                    disabled={
                                                        profile.csvPath ===
                                                            undefined ||
                                                        !profile.csvReady ||
                                                        !fs.existsSync(
                                                            profile.csvPath
                                                        )
                                                    }
                                                >
                                                    Process CSV
                                                </Button>
                                                <Button
                                                    onClick={() => {}}
                                                    variant="secondary"
                                                    disabled={
                                                        profile.csvPath ===
                                                            undefined ||
                                                        !profile.csvReady ||
                                                        !fs.existsSync(
                                                            profile.csvPath
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
                                                        pmicConnection ===
                                                            'ek-disconnected' ||
                                                        profile.csvPath ===
                                                            undefined ||
                                                        !profile.csvReady ||
                                                        !fs.existsSync(
                                                            profile.csvPath
                                                        )
                                                    }
                                                >
                                                    Load battery model
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {project.settings?.profiles.length === 0 && (
                            <Alert variant="info" label="Info ">
                                This profiles does not have any data
                            </Alert>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};
