/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Button, Card } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { removeRecentProject } from '../../../features/pmicControl/profilingProjectsSlice.';
import { ProjectPathPair } from '../types';

export default ({ project }: { project: ProjectPathPair }) => {
    const dispatch = useDispatch();
    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <div>
                        <span>{project.path}</span>
                    </div>
                    {project.error !== 'unsupportedDevice' && (
                        <div>
                            <Button
                                onClick={() =>
                                    dispatch(removeRecentProject(project.path))
                                }
                                variant="secondary"
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
            }
        >
            <div className="tw-pb-4">
                {project.error === 'fileMissing' && (
                    <Alert label="Error: " variant="danger">
                        Project settings could not be found
                    </Alert>
                )}
                {project.error === 'fileCorrupted' && (
                    <Alert label="Error: " variant="danger">
                        Project settings are corrupt or not valid format
                    </Alert>
                )}
                {project.error === 'unsupportedDevice' && (
                    <Alert label="Info: " variant="info">
                        This project is not supported for this device{' '}
                        {project.settings?.deviceType
                            ? `(supports ${project.settings.deviceType.replace(
                                  'npm',
                                  'nPM'
                              )})`
                            : ''}
                    </Alert>
                )}
            </div>
        </Card>
    );
};
