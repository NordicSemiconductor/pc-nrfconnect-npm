/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert, Card } from 'pc-nrfconnect-shared';

import { ProjectPathPair } from '../types';
import RemoveProjectButton from './RemoveProjectButton';

export default ({ project }: { project: ProjectPathPair }) => (
    <Card
        title={
            <div className="d-flex justify-content-between">
                <div>
                    <span>{project.path}</span>
                </div>
                <div>
                    <RemoveProjectButton projectSettingsPath={project.path} />
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
