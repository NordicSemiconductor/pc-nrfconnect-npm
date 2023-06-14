/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { Alert, Button, Card } from 'pc-nrfconnect-shared';

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
                </div>
            }
        >
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
        </Card>
    );
};
