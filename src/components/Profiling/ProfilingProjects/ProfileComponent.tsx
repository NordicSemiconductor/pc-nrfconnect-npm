/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    Button,
    Toggle,
    useStopwatch,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import fs from 'fs';
import path from 'path';

import { generateParamsFromCSV } from '../../../features/nrfutillNpm/csvProcessing';
import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import { readAndUpdateProjectSettings } from '../helpers';
import TimeComponent from '../TimeComponent';
import { type ProfilingProject } from '../types';
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
                    prog.path === projectSettingsPath && prog.index === index,
            ),
        [allProgress, index, projectSettingsPath],
    );

    const { time, reset, pause, isRunning } = useStopwatch({
        autoStart: false,
        resolution: 1000,
    });

    const previousProgress = useRef(progress?.progress);

    useEffect(() => {
        if (!isRunning && progress?.progress === 0 && !progress.errorLevel) {
            reset();
        }
        if (
            previousProgress.current &&
            progress?.progress != null &&
            previousProgress.current > progress.progress
        ) {
            reset();
        } else if (isRunning && (!progress || progress.errorLevel)) {
            pause();
        }

        previousProgress.current = progress?.progress;
    }, [progress, reset, pause, isRunning]);

    const message = <span>{`Temperature: ${profile.temperature}°C`}</span>;

    return (
        <div className="profile tw-pb-2 tw-pt-2">
            <div className="tw-mb-2 tw-mt-2 tw-flex tw-flex-row tw-justify-between">
                <div className="tw-mr-4 tw-grow">
                    {!dataCollected && (
                        <Alert variant="warning">
                            <strong>Profile is not complete: </strong>
                            {message}
                        </Alert>
                    )}
                    {dataCollected && !csvReadyExists && (
                        <Alert variant="danger" label="Error: ">
                            {`File ${path.resolve(
                                projectSettingsPath,
                                profile?.csvPath ?? '',
                            )} no longer exists!`}
                        </Alert>
                    )}
                    {dataCollected &&
                        csvReadyExists &&
                        (!profile.batteryJson ||
                            !profile.batteryInc ||
                            !profile.paramsJson) &&
                        !progress && (
                            <Alert variant="info">
                                <div className="d-flex align-items-center flex-wrap justify-content-between alert-info-with-button">
                                    <span>
                                        <strong>Requires processing: </strong>
                                        <span>{message}</span>
                                    </span>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            dispatch(
                                                generateParamsFromCSV(
                                                    projectSettingsPath,
                                                    index,
                                                ),
                                            );
                                        }}
                                    >
                                        Process now
                                    </Button>
                                </div>
                            </Alert>
                        )}
                    {dataCollected &&
                        csvReadyExists &&
                        ((profile.batteryJson &&
                            profile.batteryInc &&
                            profile.paramsJson) ||
                            progress) && (
                            <div className="mb-2">
                                <strong>Profile </strong>
                                <span> {message}</span>
                            </div>
                        )}
                </div>
                <div className="d-flex flex-row justify-content-between align-items-center float-right">
                    <div>
                        <Toggle
                            label="include"
                            onToggle={value => {
                                dispatch(
                                    readAndUpdateProjectSettings(
                                        projectSettingsPath,
                                        projectSettings => {
                                            if (projectSettings)
                                                projectSettings.profiles[
                                                    index
                                                ].exclude = !value;

                                            return projectSettings;
                                        },
                                    ),
                                );
                            }}
                            isToggled={!(!!profile.exclude || !dataCollected)}
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
                            alpha={0.1}
                        />
                        <Button
                            className="ml-2"
                            size="lg"
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
                                    ? 'Caution:'
                                    : 'Error:'
                            }`}</strong>{' '}
                            {progress.message}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                progress.cancel();
                            }}
                        >
                            Close
                        </button>
                    </div>
                </Alert>
            )}
        </div>
    );
};
