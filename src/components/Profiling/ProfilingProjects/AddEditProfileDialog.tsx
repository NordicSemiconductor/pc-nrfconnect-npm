/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
    Button,
    DialogButton,
    GenericDialog,
    NumberInput,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import path from 'path';

import { showOpenDialog } from '../../../actions/fileActions';
import { readAndUpdateProjectSettings } from '../helpers';
import { ProfilingProjectProfile } from '../types';

export default ({
    projectSettingsPath,
    profile,
    onClose,
}: {
    projectSettingsPath: string;
    profile?: ProfilingProjectProfile & { index: number };
    onClose: () => void;
}) => {
    const [temperature, setTemperature] = useState<number>(
        profile?.temperature ?? 25,
    );
    const [csvPath, setCsvPath] = useState<string | undefined>(
        profile?.csvPath,
    );

    const dispatch = useDispatch();

    return (
        <GenericDialog
            title={`${profile ? 'Edit' : 'Add'} Profile`}
            isVisible
            size="sm"
            className="app-dialog"
            closeOnEsc={false}
            footer={
                <>
                    <DialogButton
                        disabled={!csvPath}
                        variant="primary"
                        onClick={() => {
                            dispatch(
                                readAndUpdateProjectSettings(
                                    projectSettingsPath,
                                    project => {
                                        if (profile) {
                                            const csvPathChanged =
                                                csvPath !== profile?.csvPath;
                                            project.profiles[profile.index] = {
                                                ...project.profiles[
                                                    profile.index
                                                ],
                                                temperature,
                                                csvPath,
                                                batteryJson: csvPathChanged
                                                    ? undefined
                                                    : project.profiles[
                                                          profile.index
                                                      ].batteryJson,
                                                batteryInc: csvPathChanged
                                                    ? undefined
                                                    : project.profiles[
                                                          profile.index
                                                      ].batteryInc,
                                                paramsJson: csvPathChanged
                                                    ? undefined
                                                    : project.profiles[
                                                          profile.index
                                                      ].paramsJson,
                                            };
                                        } else {
                                            project.profiles.push({
                                                temperature,
                                                csvReady: true,
                                                csvPath,
                                            });
                                        }
                                        return project;
                                    },
                                ),
                            );
                            onClose();
                        }}
                    >
                        Save
                    </DialogButton>

                    <DialogButton onClick={onClose}>Cancel</DialogButton>
                </>
            }
        >
            <div className="tw-flex tw-flex-col tw-gap-2">
                <div>
                    <NumberInput
                        label={
                            <div>
                                <span>Temperature</span>
                            </div>
                        }
                        unit="°C"
                        value={temperature}
                        range={{
                            min: -45,
                            max: 85,
                        }}
                        onChange={value => setTemperature(value)}
                        showSlider
                    />
                </div>
                <div className="flex-column">
                    <div>{csvPath ?? 'No data file set'}</div>
                    <Button
                        className="mt-2"
                        variant="secondary"
                        onClick={() => {
                            showOpenDialog({
                                title: 'Profile Data',
                                defaultPath: csvPath
                                    ? path.resolve(projectSettingsPath, csvPath)
                                    : undefined,
                                filters: [
                                    {
                                        name: 'Comma separated values',
                                        extensions: ['csv'],
                                    },
                                ],
                            }).then(result => {
                                if (!result.canceled && result.filePaths[0]) {
                                    const newPath = path.relative(
                                        projectSettingsPath,
                                        result.filePaths[0],
                                    );
                                    setCsvPath(newPath);
                                }
                            });
                        }}
                    >
                        Select data file
                    </Button>
                </div>
            </div>
        </GenericDialog>
    );
};
