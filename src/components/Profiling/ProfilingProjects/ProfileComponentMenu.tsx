/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useMemo, useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { useDispatch, useSelector } from 'react-redux';

import { showSaveDialog } from '../../../actions/fileActions';
import { stringToFile } from '../../../features/helpers';
import { generateParamsFromCSV } from '../../../features/nrfutillNpm/csvProcessing';
import { showDialog } from '../../../features/pmicControl/downloadBatteryModelSlice';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import {
    isProfileReadyForProcessing,
    readAndUpdateProjectSettings,
} from '../helpers';
import { ProfilingProject } from '../types';
import AddEditProfileDialog from './AddEditProfileDialog';

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
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();
    const profile = project.profiles[index];
    const allProgress = useSelector(getProjectProfileProgress);
    const progress = useMemo(
        () =>
            allProgress.find(
                prog =>
                    prog.path === projectSettingsPath && prog.index === index
            ),
        [allProgress, index, projectSettingsPath]
    );
    const [showEditDialog, setShowEditDialog] = useState(false);
    const isProcessing = !!progress && !progress.errorLevel;

    return (
        <>
            <DropdownButton
                className="ml-2 mt-0"
                variant="secondary"
                title="Profile"
                alignRight
            >
                <Dropdown.Item
                    disabled={
                        isProcessing ||
                        !isProfileReadyForProcessing(
                            projectSettingsPath,
                            profile
                        )
                    }
                    onClick={() => {
                        dispatch(
                            generateParamsFromCSV(projectSettingsPath, index)
                        );
                    }}
                >
                    Process Data
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    disabled={!profile.batteryJson || !profile.batteryInc}
                    onClick={() => {
                        showSaveDialog({
                            title: 'Battery Model',
                            defaultPath: `${project.name}_${profile.temperature}C.inc`,
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
                            if (
                                profile.batteryJson &&
                                profile.batteryInc &&
                                !result.canceled &&
                                result.filePath
                            ) {
                                if (result.filePath?.endsWith('.json')) {
                                    stringToFile(
                                        result.filePath,
                                        profile.batteryJson
                                    );
                                } else if (result.filePath?.endsWith('.inc')) {
                                    stringToFile(
                                        result.filePath,
                                        profile.batteryInc
                                    );
                                }
                            }
                        });
                    }}
                >
                    Save Battery Model
                </Dropdown.Item>
                <Dropdown.Item
                    disabled={
                        uiDisabled ||
                        pmicConnection === 'ek-disconnected' ||
                        !profile.batteryJson
                    }
                    onClick={() => {
                        if (profile.batteryJson && npmDevice) {
                            dispatch(
                                showDialog({
                                    buffer: Buffer.from(profile.batteryJson),
                                    name: project.name,
                                })
                            );
                        }
                    }}
                >
                    Write Battery Model
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    disabled={isProcessing}
                    onClick={() => {
                        setShowEditDialog(true);
                    }}
                >
                    Edit Profile
                </Dropdown.Item>
                <Dropdown.Item
                    disabled={isProcessing}
                    onClick={() => {
                        progress?.cancel();
                        dispatch(
                            readAndUpdateProjectSettings(
                                projectSettingsPath,
                                projectSettings => {
                                    projectSettings.profiles.splice(index, 1);

                                    return projectSettings;
                                }
                            )
                        );
                    }}
                >
                    Remove Profile
                </Dropdown.Item>
            </DropdownButton>
            {showEditDialog && (
                <AddEditProfileDialog
                    projectSettingsPath={projectSettingsPath}
                    profile={{ ...profile, index }}
                    onClose={() => {
                        setShowEditDialog(false);
                    }}
                />
            )}
        </>
    );
};
