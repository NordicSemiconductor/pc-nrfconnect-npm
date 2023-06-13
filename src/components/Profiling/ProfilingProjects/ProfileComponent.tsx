/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import fs from 'fs';
import path from 'path';
import { Alert, Button, Toggle, useStopwatch } from 'pc-nrfconnect-shared';

import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import { atomicUpdateProjectSettings } from '../helpers';
import TimeComponent from '../TimeComponent';
import { ProfilingProject } from '../types';
import ProfileComponentMenu from './ProfileComponentMenu';

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

    const profile = project.profiles[index];

    const dataCollected = !!profile.csvPath && profile.csvReady;
    const csvReadyExists =
        !!profile.csvPath &&
        fs.existsSync(path.resolve(projectSettingsPath, profile.csvPath));
    const allProgress = useSelector(getProjectProfileProgress);

    const progress = useMemo(
        () =>
            allProgress.find(
                prog =>
                    prog.path === projectSettingsPath && prog.index === index
            ),
        [allProgress, index, projectSettingsPath]
    );

    const { time, reset, pause, isRunning } = useStopwatch({
        autoStart: false,
        resolution: 1000,
    });

    useEffect(() => {
        if (!isRunning && progress?.progress === 0 && !progress.errorLevel) {
            reset();
        } else if (isRunning && (!progress || progress.errorLevel)) {
            pause();
        }
    }, [progress, reset, pause, isRunning]);

    const message = (
        <span>
            {`Temperature: ${profile.temperature} °C, V`}
            <span className="subscript">TERM</span>
            {` ${profile.vUpperCutOff} V,  Discharge cut-off voltage: ${profile.vLowerCutOff} V.`}
        </span>
    );

    return (
        <div className="profile pt-2 pb-2">
            <div className="d-flex flex-row justify-content-between mt-2 mb-2">
                <div className="flex-grow-1 mr-4">
                    {!dataCollected && (
                        <Alert variant="warning">
                            <strong>Profile is incomplete </strong>
                            {message}
                        </Alert>
                    )}
                    {dataCollected && !csvReadyExists && (
                        <Alert variant="danger" label="Error: ">
                            {`File ${path.resolve(
                                projectSettingsPath,
                                profile?.csvPath ?? ''
                            )} no longer exists!`}
                        </Alert>
                    )}
                    {dataCollected &&
                        csvReadyExists &&
                        !profile.batteryJson &&
                        !profile.paramsJson &&
                        !progress && (
                            <Alert variant="info">
                                <strong>Requirers processing </strong>
                                <span>{message}</span>
                            </Alert>
                        )}
                    {dataCollected &&
                        csvReadyExists &&
                        ((profile.batteryJson && profile.paramsJson) ||
                            progress) && (
                            <div className="mb-2">
                                <strong>Profile </strong>
                                <span> {message}</span>
                            </div>
                        )}
                </div>
                <div className="d-flex flex-row justify-content-between  align-items-center float-right">
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
                            isToggled={!!profile.exclude || !dataCollected}
                            disabled={!dataCollected}
                        />
                    </div>
                    <ProfileComponentMenu
                        projectSettingsPath={projectSettingsPath}
                        project={project}
                        index={index}
                    />
                </div>
            </div>
            {progress && !progress.errorLevel && (
                <div className="mt-2 mb-2">
                    <div>{progress.message}</div>
                    <div className="d-flex align-items-end">
                        <TimeComponent
                            time={time}
                            progress={progress.progress ?? 0}
                        />
                        <Button
                            className="ml-2"
                            large
                            variant="secondary"
                            onClick={() => {
                                progress.cancel();
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
            {progress && progress.errorLevel && (
                <Alert
                    label=""
                    variant={
                        progress.errorLevel === 'warning' ? 'warning' : 'danger'
                    }
                >
                    <div className="d-flex align-items-center flex-wrap alert-warning-with-button">
                        <span>
                            <strong>{`${
                                progress.errorLevel === 'warning'
                                    ? 'Caution'
                                    : 'Error'
                            }`}</strong>{' '}
                            {progress.message}
                        </span>
                        <Button
                            variant="custom"
                            onClick={() => {
                                progress.cancel();
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </Alert>
            )}
        </div>
    );
};
