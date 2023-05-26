/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import fs from 'fs';
import path from 'path';
import { Alert, Button, Toggle } from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import { atomicUpdateProjectSettings } from '../helpers';
import { ProfilingProject } from '../types';

import './profilingProjects.scss';

export default ({
    projectSettingsPath,
    project,
    index,
}: {
    projectSettingsPath: string;
    project: ProfilingProject;
    index: number;
}) => {
    const dispatch = useDispatch();
    const npmDevice = useSelector(getNpmDevice);

    const profile = project.profiles[index];

    const complete = !!profile.csvPath && profile.csvReady;
    const csvReadyExists =
        !!profile.csvPath &&
        fs.existsSync(path.resolve(projectSettingsPath, profile.csvPath));
    const progress = useSelector(getProjectProfileProgress).find(
        prog => prog.path === projectSettingsPath && prog.index === index
    );

    return (
        <div className="profile pt-2 pb-2">
            <div className="d-flex flex-row justify-content-between mt-2 mb-2">
                <div className="flex-grow-1 mr-4">
                    {!complete && (
                        <Alert variant="info">
                            <strong>Profile is incomplete.</strong>
                            <span>{` Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V.`}</span>
                        </Alert>
                    )}
                    {complete && !csvReadyExists && (
                        <Alert variant="danger" label="Error ">
                            {`File ${path.resolve(
                                projectSettingsPath,
                                profile?.csvPath ?? ''
                            )} no longer exists!`}
                        </Alert>
                    )}
                    {complete &&
                        csvReadyExists &&
                        !profile.batteryJson &&
                        !profile.paramsJson && (
                            <Alert variant="info">
                                <strong>Requirers precessing</strong>
                                <span>{` Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V.`}</span>
                            </Alert>
                        )}
                    {complete &&
                        csvReadyExists &&
                        profile.batteryJson &&
                        profile.paramsJson && (
                            <div className="mb-2">
                                <strong>Profile</strong>
                                <span>{` - Temperature: ${profile.temperature} °C, Upper Cutoff: ${profile.vUpperCutOff} V,  Lower Cutoff: ${profile.vLowerCutOff} V`}</span>
                            </div>
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
                        <Button onClick={() => {}} variant="secondary">
                            Edit
                        </Button>
                        <Button
                            onClick={() => {
                                dispatch(
                                    atomicUpdateProjectSettings(
                                        projectSettingsPath,
                                        projectSettings => {
                                            projectSettings.profiles.splice(
                                                index,
                                                1
                                            );

                                            return projectSettings;
                                        }
                                    )
                                );
                                if (profile.batteryJson) {
                                    npmDevice?.downloadFuelGaugeProfile(
                                        Buffer.from(profile.batteryJson)
                                    );
                                }
                            }}
                            variant="secondary"
                        >
                            Remove
                        </Button>
                    </div>
                </div>
            </div>
            {progress && (progress.error || !progress.ready) && (
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
