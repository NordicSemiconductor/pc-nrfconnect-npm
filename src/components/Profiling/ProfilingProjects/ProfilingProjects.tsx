/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OpenDialogReturnValue } from 'electron';
import { Button } from 'pc-nrfconnect-shared';

import { showOpenDialog } from '../../../actions/fileActions';
import { getProfileProjects } from '../../../features/pmicControl/profilingProjectsSlice.';
import { addRecentProject, reloadRecentProjects } from '../helpers';
import MissingProjectSettingsCard from './MissingProjectSettingsCard';
import ProjectCard from './ProjectCard';
import { useProfilingProjects } from './useProfilingProjects';

import './profilingProjects.scss';

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
                <Button onClick={() => {}} variant="secondary">
                    Create new profile
                </Button>
                <div className="d-flex flex-column-reverse">
                    {profiles.map(project => (
                        <React.Fragment key={project.path}>
                            {(project.settings === 'fileMissing' ||
                                project.settings === 'fileCorrupted') && (
                                <MissingProjectSettingsCard project={project} />
                            )}
                            {typeof project.settings === 'object' && (
                                <ProjectCard
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
