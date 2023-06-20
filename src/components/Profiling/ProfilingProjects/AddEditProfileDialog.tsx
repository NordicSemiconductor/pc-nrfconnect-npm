/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { useDispatch } from 'react-redux';
import path from 'path';
import {
    Button,
    DialogButton,
    GenericDialog,
    Group,
    NumberInlineInput,
    Slider,
} from 'pc-nrfconnect-shared';

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
        profile?.temperature ?? 25
    );
    const [csvPath, setCsvPath] = useState<string | undefined>(
        profile?.csvPath
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
                                    }
                                )
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
            <Group>
                <div className="flex-row">
                    <div className="flex-grow-1 slider-container">
                        <FormLabel className="flex-row">
                            <div>
                                <span>Temperature</span>
                            </div>

                            <div className="flex-row">
                                <NumberInlineInput
                                    value={temperature}
                                    range={{
                                        min: -45,
                                        max: 85,
                                    }}
                                    onChange={value => setTemperature(value)}
                                />
                                <span>°C</span>
                            </div>
                        </FormLabel>
                        <Slider
                            values={[temperature]}
                            onChange={[
                                (value: number) => setTemperature(value),
                            ]}
                            range={{
                                min: -45,
                                max: 85,
                            }}
                        />
                    </div>
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
                                        result.filePaths[0]
                                    );
                                    setCsvPath(newPath);
                                }
                            });
                        }}
                    >
                        Select data file
                    </Button>
                </div>
            </Group>
        </GenericDialog>
    );
};
