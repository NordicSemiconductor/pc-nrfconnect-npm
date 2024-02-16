/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Button,
    CollapsibleGroup,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { OpenDialogReturnValue } from 'electron';
import fs from 'fs';
import path from 'path';

import {
    loadBatteryProfile,
    showOpenDialog,
    showSaveDialog,
} from '../../../actions/fileActions';
import { getBundledBatteries } from '../../../features/helpers';
import { showDialog } from '../../../features/pmicControl/downloadBatteryModelSlice';
import {
    getNpmDevice,
    getPmicState,
} from '../../../features/pmicControl/pmicControlSlice';
import {
    addRecentProject,
    getProfileProjects,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import { reloadRecentProjects } from '../helpers';
import AddEditProjectDialog from './AddEditProjectDialog';
import MissingProjectSettingsCard from './MissingProjectSettingsCard';
import ProjectCard from './ProjectCard';
import { useProfilingProjects } from './useProfilingProjects';

import './profilingProjects.scss';

const BundledBatteryItem = ({
    model,
    rootFolder,
}: {
    model: { name: string; inc: boolean; json: boolean };
    rootFolder: string;
}) => {
    const dispatch = useDispatch();
    const disabled = useIsUIDisabled();
    const pmicState = useSelector(getPmicState);

    return (
        <div className="tw-flex tw-flex-row tw-justify-between tw-border-0 tw-border-b tw-border-solid tw-border-black tw-border-opacity-10 tw-py-1">
            <div>{model.name}</div>
            <div className="tw-flex tw-gap-1">
                <Button
                    variant="secondary"
                    onClick={() => {
                        loadBatteryProfile(
                            path.join(rootFolder, `${model.name}.json`)
                        ).then(buffer => {
                            dispatch(showDialog({ buffer, name: model.name }));
                        });
                    }}
                    disabled={
                        disabled ||
                        !model.json ||
                        pmicState === 'ek-disconnected'
                    }
                >
                    Write Model
                </Button>
                <Button
                    variant="secondary"
                    onClick={() => {
                        const filters = [];
                        if (model.inc) {
                            filters.push({
                                name: 'INC',
                                extensions: ['inc'],
                            });
                        }
                        if (model.json) {
                            filters.push({
                                name: 'JSON',
                                extensions: ['json'],
                            });
                        }
                        showSaveDialog({
                            title: 'Battery Model',
                            defaultPath: `${model.name}.${
                                model.inc ? 'inc' : 'json'
                            }`,
                            filters,
                        }).then(result => {
                            if (!result.canceled && result.filePath) {
                                fs.copyFileSync(
                                    path.join(
                                        rootFolder,
                                        `${model.name}${
                                            path.parse(result.filePath).ext
                                        }`
                                    ),
                                    result.filePath
                                );
                            }
                        });
                    }}
                >
                    Save Model
                </Button>
            </div>
        </div>
    );
};

const BundledBatteryList = ({
    bundledBattery,
}: {
    bundledBattery: {
        brandName: string;
        folder: string;
        fileNames: string[];
    };
}) => {
    const models: {
        name: string;
        inc: boolean;
        json: boolean;
    }[] = [];

    bundledBattery.fileNames.forEach(name => {
        const parsed = path.parse(name);

        if (
            parsed.ext.toLocaleLowerCase() === '.json' ||
            parsed.ext.toLocaleLowerCase() === '.inc'
        ) {
            let model = models.find(m => m.name === parsed.name);
            if (!model) {
                model = {
                    name: parsed.name,
                    json: false,
                    inc: false,
                };
                models.push(model);
            }

            switch (parsed.ext.toLocaleLowerCase()) {
                case '.json':
                    model.json = true;
                    break;
                case '.inc':
                    model.inc = true;
                    break;
            }
        }
    });

    return (
        <CollapsibleGroup
            heading={bundledBattery.brandName}
            defaultCollapsed={false}
        >
            <div className=" tw-flex tw-flex-col tw-gap-0.5">
                {models.map(model => (
                    <BundledBatteryItem
                        rootFolder={bundledBattery.folder}
                        model={model}
                        key={model.name}
                    />
                ))}
            </div>
        </CollapsibleGroup>
    );
};

export default () => {
    const dispatch = useDispatch();
    const projects = useSelector(getProfileProjects);
    const npmDevice = useSelector(getNpmDevice);

    const [showAddProjectDialog, setShowAddProjectDialog] = useState(false);
    useProfilingProjects();

    const bundledBatteries = useMemo(
        () => getBundledBatteries(npmDevice?.getDeviceType() ?? 'npm1300'),
        [npmDevice]
    );

    return (
        <div className="projects-container tw-flex tw-flex-col">
            <CollapsibleGroup
                heading="Custom Profiles"
                defaultCollapsed={false}
            >
                <div className="tw-flex tw-justify-end tw-gap-2">
                    <Button
                        onClick={() => dispatch(reloadRecentProjects())}
                        variant="secondary"
                    >
                        Reload Projects
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
                        Add Existing Project
                    </Button>
                    <Button
                        onClick={() => {
                            setShowAddProjectDialog(true);
                        }}
                        variant="secondary"
                    >
                        Create New Project
                    </Button>
                </div>

                <div className="d-flex flex-column-reverse">
                    {projects.map(project => (
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
            </CollapsibleGroup>
            <CollapsibleGroup heading="Bundled Profiles">
                <div className=" tw-flex tw-flex-col tw-gap-4 tw-bg-white tw-p-4">
                    {bundledBatteries.map(bundledBattery => (
                        <BundledBatteryList
                            bundledBattery={bundledBattery}
                            key={bundledBattery.brandName}
                        />
                    ))}
                </div>
            </CollapsibleGroup>
        </div>
    );
};
