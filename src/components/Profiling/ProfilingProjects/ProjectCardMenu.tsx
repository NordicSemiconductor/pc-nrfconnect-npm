/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';
import {
    Alert,
    DialogButton,
    GenericDialog,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { shell } from 'electron';
import path from 'path';

import { showSaveDialog } from '../../../actions/fileActions';
import { stringToFile } from '../../../features/helpers';
import {
    generateParamsFromCSV,
    mergeBatteryParams,
} from '../../../features/nrfutillNpm/csvProcessing';
import { showDialog } from '../../../features/pmicControl/downloadBatteryModelSlice';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import {
    getProjectProfileProgress,
    removeRecentProject,
} from '../../../features/pmicControl/profilingProjectsSlice.';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import { isProfileReadyForProcessing } from '../helpers';
import { type ProfilingProject } from '../types';
import AddEditProfileDialog from './AddEditProfileDialog';
import AddEditProjectDialog from './AddEditProjectDialog';

export default ({
    projectSettingsPath,
    project,
}: {
    projectSettingsPath: string;
    project: ProfilingProject;
}) => {
    const dispatch = useDispatch();
    const [
        generatingBatterModelErrorMessage,
        setGeneratingBatterModelErrorMessage,
    ] = useState<Error>();
    const [generatingBatterModel, setGeneratingBatterModel] = useState(false);
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.pmicState;
    const allProgress = useSelector(getProjectProfileProgress).filter(
        progress => progress.path === projectSettingsPath,
    );
    const projectProgress = useMemo(
        () =>
            allProgress.filter(
                progress => progress.path === projectSettingsPath,
            ),
        [allProgress, projectSettingsPath],
    );

    const includedProfiles = useMemo(
        () =>
            project.profiles.filter(
                profile =>
                    !profile.exclude && profile.csvReady && profile.csvPath,
            ),
        [project],
    );
    const [showAddProfileDialog, setShowAddProfileDialog] = useState(false);
    const [showEditProjectDialog, setShowEditProjectDialog] = useState(false);

    return (
        <>
            <DropdownButton
                className="ml-2 mt-0"
                variant="secondary"
                title="Project"
                alignRight
            >
                <Dropdown.Item
                    disabled={
                        includedProfiles.length === 0 ||
                        projectProgress.filter(
                            progress =>
                                !project.profiles[progress.index].exclude &&
                                !progress.errorLevel,
                        ).length === includedProfiles.length ||
                        includedProfiles.filter(profile =>
                            isProfileReadyForProcessing(
                                projectSettingsPath,
                                profile,
                            ),
                        ).length === 0
                    }
                    onClick={() => {
                        includedProfiles.forEach((setting, index) => {
                            const inProgress =
                                projectProgress.find(
                                    progress => progress.index === index,
                                ) !== undefined;

                            if (!setting.exclude && !inProgress) {
                                dispatch(
                                    generateParamsFromCSV(
                                        projectSettingsPath,
                                        index,
                                    ),
                                );
                            }
                        });
                    }}
                >
                    Process Included Data
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    onClick={() => {
                        showSaveDialog({
                            title: 'Battery Model',
                            defaultPath: `${project.name}_${includedProfiles
                                .map(profile => `${profile.temperature}`)
                                .join('C_')}C.inc`,
                            filters: [
                                {
                                    name: 'INC',
                                    extensions: ['inc'],
                                },
                                {
                                    name: 'JSON',
                                    extensions: ['json'],
                                },
                            ],
                        }).then(result => {
                            if (!result.canceled && result.filePath) {
                                setGeneratingBatterModel(true);
                                mergeBatteryParams(project, includedProfiles)
                                    .then(data => {
                                        if (
                                            result.filePath?.endsWith('.json')
                                        ) {
                                            stringToFile(
                                                result.filePath,
                                                data.json,
                                            );
                                        } else if (
                                            result.filePath?.endsWith('.inc')
                                        ) {
                                            stringToFile(
                                                result.filePath,
                                                data.inc,
                                            );
                                        }
                                        setGeneratingBatterModel(false);
                                    })
                                    .catch(
                                        setGeneratingBatterModelErrorMessage,
                                    );
                            }
                        });
                    }}
                    disabled={
                        includedProfiles.length === 0 ||
                        includedProfiles.filter(
                            profile =>
                                profile.paramsJson === undefined ||
                                !isProfileReadyForProcessing(
                                    projectSettingsPath,
                                    profile,
                                ),
                        ).length > 0
                    }
                >
                    Save Battery Model
                </Dropdown.Item>
                <Dropdown.Item
                    onClick={() => {
                        setGeneratingBatterModel(true);
                        mergeBatteryParams(project, includedProfiles)
                            .then(data => {
                                if (npmDevice) {
                                    dispatch(
                                        showDialog({
                                            buffer: Buffer.from(data.json),
                                            name: project.name,
                                        }),
                                    );
                                }
                                setGeneratingBatterModel(false);
                            })
                            .catch(setGeneratingBatterModelErrorMessage);
                    }}
                    disabled={
                        uiDisabled ||
                        pmicConnection === 'ek-disconnected' ||
                        includedProfiles.length === 0 ||
                        includedProfiles.filter(
                            profile =>
                                profile.paramsJson === undefined ||
                                !isProfileReadyForProcessing(
                                    projectSettingsPath,
                                    profile,
                                ),
                        ).length > 0
                    }
                >
                    Write Battery Model
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    onClick={() => {
                        setShowAddProfileDialog(true);
                    }}
                >
                    Add Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    disabled={
                        projectProgress.filter(progress => !progress.errorLevel)
                            .length > 0
                    }
                    onClick={() => {
                        shell.openPath(path.parse(projectSettingsPath).dir);
                    }}
                >
                    Open Folder
                </Dropdown.Item>
                <Dropdown.Item
                    disabled={
                        projectProgress.filter(progress => !progress.errorLevel)
                            .length > 0
                    }
                    onClick={() => {
                        setShowEditProjectDialog(true);
                    }}
                >
                    Edit Project
                </Dropdown.Item>
                <Dropdown.Item
                    disabled={
                        projectProgress.filter(progress => !progress.errorLevel)
                            .length > 0
                    }
                    onClick={() => {
                        projectProgress.forEach(progress => {
                            progress.cancel();
                        });
                        dispatch(removeRecentProject(projectSettingsPath));
                    }}
                >
                    Remove Project
                </Dropdown.Item>
            </DropdownButton>
            <GenericDialog
                title="Battery Model"
                className="app-dialog"
                onHide={() => {}}
                showSpinner={!generatingBatterModelErrorMessage}
                isVisible={generatingBatterModel}
                footer={
                    generatingBatterModelErrorMessage ? (
                        <DialogButton
                            onClick={() => setGeneratingBatterModel(false)}
                        >
                            Close
                        </DialogButton>
                    ) : null
                }
            >
                {generatingBatterModelErrorMessage ? (
                    <Alert variant="danger" label="Error: ">
                        {generatingBatterModelErrorMessage.message}
                    </Alert>
                ) : (
                    'Generating battery model...'
                )}
            </GenericDialog>
            {showAddProfileDialog && (
                <AddEditProfileDialog
                    projectSettingsPath={projectSettingsPath}
                    onClose={() => {
                        setShowAddProfileDialog(false);
                    }}
                />
            )}
            {showEditProjectDialog && (
                <AddEditProjectDialog
                    projectSettings={{ project, projectSettingsPath }}
                    onClose={() => {
                        setShowEditProjectDialog(false);
                    }}
                />
            )}
        </>
    );
};
