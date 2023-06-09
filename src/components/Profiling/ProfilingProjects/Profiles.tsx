/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';
import { OpenDialogReturnValue } from 'electron';

import { showOpenDialog } from '../../../actions/fileActions';
import {
    getNpmDevice,
    getPmicState,
} from '../../../features/pmicControl/pmicControlSlice';
import {
    addRecentProject,
    getProfileProjects,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import { setProfilingStage } from '../../../features/pmicControl/profilingSlice';
import { reloadRecentProjects } from '../helpers';
import AddEditProjectDialog from './AddEditProjectDialog';
import MissingProjectSettingsCard from './MissingProjectSettingsCard';
import ProjectCard from './ProjectCard';
import { useProfilingProjects } from './useProfilingProjects';

import './profilingProjects.scss';

export default () => {
    const dispatch = useDispatch();
    const profiles = useSelector(getProfileProjects);
    const npmDevice = useSelector(getNpmDevice);
    const pmicState = useSelector(getPmicState);

    const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
    useProfilingProjects();

    return (
        <div className="profiles-container d-flex flex-column">
            <DropdownButton
                className="align-self-end mr-3"
                variant="secondary"
                title="Projects"
                alignRight
            >
                <Dropdown.Item
                    onClick={() => dispatch(reloadRecentProjects())}
                    variant="secondary"
                >
                    Reload Projects
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
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
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={() => {
                        setShowAddProjectDialog(true);
                    }}
                    variant="secondary"
                >
                    Create New Project
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    onClick={() => {
                        npmDevice
                            ?.getBatteryProfiler()
                            ?.canProfile()
                            .then(result => {
                                if (result) {
                                    dispatch(
                                        setProfilingStage('Configuration')
                                    );
                                } else {
                                    dispatch(
                                        setProfilingStage('MissingSyncBoard')
                                    );
                                }
                            });
                    }}
                    disabled={pmicState !== 'pmic-connected'}
                    variant="secondary"
                >
                    Profile Battery
                </Dropdown.Item>
            </DropdownButton>

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
