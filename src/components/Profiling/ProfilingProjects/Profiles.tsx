/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OpenDialogReturnValue } from 'electron';
import { Button } from 'pc-nrfconnect-shared';

import { showOpenDialog } from '../../../actions/fileActions';
import {
    addRecentProject,
    getProfileProjects,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import { reloadRecentProjects } from '../helpers';
import AddEditProjectDialog from './AddEditProjectDialog';
import MissingProjectSettingsCard from './MissingProjectSettingsCard';
import ProjectCard from './ProjectCard';
import { useProfilingProjects } from './useProfilingProjects';

import './profilingProjects.scss';

export default () => {
    const dispatch = useDispatch();
    const profiles = useSelector(getProfileProjects);

    const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
    useProfilingProjects();

    return (
        <div className="projects-container d-flex flex-column">
            <div className="d-flex justify-content-end">
                <Button
                    className="mx-1"
                    onClick={() => dispatch(reloadRecentProjects())}
                    variant="secondary"
                >
                    Reload Projects
                </Button>
                <Button
                    className="mx-1"
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
                    Add Existing Project
                </Button>
                <Button
                    className="mx-1"
                    onClick={() => {
                        setShowAddProjectDialog(true);
                    }}
                    variant="secondary"
                >
                    Create New Project
                </Button>
            </div>

            <div className="d-flex flex-column-reverse">
                {profiles.map(project => (
                    <React.Fragment key={project.path}>
                        {project.error && (
                            <MissingProjectSettingsCard project={project} />
                        )}
                        {project.settings && (
                            <ProjectCard
                                projectSettingsPath={project.path}
                                settings={project.settings}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            {showAddProjectDialog && (
                <AddEditProjectDialog
                    onClose={() => {
                        setShowAddProjectDialog(false);
                    }}
                />
            )}
        </div>
    );
};
