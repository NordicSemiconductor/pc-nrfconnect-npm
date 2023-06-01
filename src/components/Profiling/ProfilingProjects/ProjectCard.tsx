/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Card, GenericDialog } from 'pc-nrfconnect-shared';

import { showSaveDialog } from '../../../actions/fileActions';
import { stringToFile } from '../../../features/helpers';
import {
    generateParamsFromCSV,
    mergeBatteryParams,
} from '../../../features/nrfutillNpm/csvProcessing';
import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import { getProjectProfileProgress } from '../../../features/pmicControl/profilingProjectsSlice.';
import useIsUIDisabled from '../../../features/useIsUIDisabled';
import { isProfileReadyForProcessing } from '../helpers';
import { ProfilingProject } from '../types';
import ProfileComponent from './ProfileComponent';
import RemoveProjectButton from './RemoveProjectButton';

export default ({
    projectSettingsPath,
    settings,
}: {
    projectSettingsPath: string;
    settings: ProfilingProject;
}) => {
    const dispatch = useDispatch();
    const uiDisabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const pmicConnection = npmDevice?.getConnectionState();
    const allProgress = useSelector(getProjectProfileProgress).filter(
        prog => prog.path === projectSettingsPath && !prog.ready
    );
    const [generatingBatterModel, setGeneratingBatterModel] = useState(false);
    const includedProfiles = settings.profiles.filter(
        profile => !profile.exclude
    );

    return (
        <Card
            title={
                <div className="d-flex justify-content-between">
                    <div>
                        <span>
                            <span>{`${settings.name} - Capacity ${settings.capacity} - `}</span>
                        </span>
                        <span>{projectSettingsPath}</span>
                    </div>
                    <div>
                        <Button
                            onClick={() => {
                                settings.profiles.forEach((setting, index) => {
                                    const inProgress =
                                        allProgress.find(
                                            progress => progress.index === index
                                        ) !== undefined;

                                    if (!setting.exclude && !inProgress) {
                                        dispatch(
                                            generateParamsFromCSV(
                                                projectSettingsPath,
                                                index
                                            )
                                        );
                                    }
                                });
                            }}
                            variant="secondary"
                            disabled={
                                includedProfiles.length === 0 ||
                                allProgress.filter(
                                    progress =>
                                        !settings.profiles[progress.index]
                                            .exclude
                                ).length === includedProfiles.length ||
                                settings.profiles.filter(profile =>
                                    isProfileReadyForProcessing(
                                        projectSettingsPath,
                                        profile
                                    )
                                ).length === 0
                            }
                        >
                            Process data
                        </Button>
                        <Button
                            onClick={() => {
                                showSaveDialog({
                                    title: 'Battery Model',
                                    defaultPath: `${settings.name}.json`,
                                    filters: [
                                        {
                                            name: 'JSON',
                                            extensions: ['json'],
                                        },
                                    ],
                                }).then(result => {
                                    if (!result.canceled && result.filePath) {
                                        setGeneratingBatterModel(true);
                                        mergeBatteryParams(
                                            settings,
                                            includedProfiles
                                        )
                                            .then(data => {
                                                if (result.filePath)
                                                    stringToFile(
                                                        result.filePath,
                                                        data
                                                    );
                                            })
                                            .finally(() =>
                                                setGeneratingBatterModel(false)
                                            );
                                    }
                                });
                            }}
                            variant="secondary"
                            disabled={
                                includedProfiles.length === 0 ||
                                includedProfiles.filter(
                                    profile =>
                                        profile.paramsJson === undefined ||
                                        !isProfileReadyForProcessing(
                                            projectSettingsPath,
                                            profile
                                        )
                                ).length > 0
                            }
                        >
                            Save Model
                        </Button>
                        <Button
                            onClick={() => {
                                setGeneratingBatterModel(true);
                                mergeBatteryParams(settings, includedProfiles)
                                    .then(data =>
                                        npmDevice?.downloadFuelGaugeProfile(
                                            Buffer.from(data)
                                        )
                                    )
                                    .finally(() =>
                                        setGeneratingBatterModel(false)
                                    );
                            }}
                            variant="secondary"
                            disabled={
                                uiDisabled ||
                                pmicConnection === 'ek-disconnected' ||
                                includedProfiles.length === 0 ||
                                includedProfiles.filter(
                                    profile =>
                                        profile.paramsJson === undefined ||
                                        !isProfileReadyForProcessing(
                                            projectSettingsPath,
                                            profile
                                        )
                                ).length > 0
                            }
                        >
                            Load battery model
                        </Button>
                        <Button onClick={() => {}} variant="secondary">
                            Edit
                        </Button>
                        <Button onClick={() => {}} variant="secondary">
                            Add
                        </Button>
                        <RemoveProjectButton
                            projectSettingsPath={projectSettingsPath}
                        />
                    </div>
                </div>
            }
        >
            {settings.profiles.length === 0 && (
                <Alert variant="info" label="Info ">
                    This profiles does not have any data
                </Alert>
            )}
            {settings.profiles.length > 0 && (
                <div className="d-flex flex-column justify-content-between">
                    {settings.profiles.map((profile, index) => (
                        <ProfileComponent
                            key={`${settings.name}${profile.temperature}${
                                index + 1
                            }`}
                            projectSettingsPath={projectSettingsPath}
                            project={settings}
                            index={index}
                        />
                    ))}
                </div>
            )}
            <GenericDialog
                title="Battery Model"
                onHide={() => {}}
                showSpinner
                isVisible={generatingBatterModel}
                footer={null}
            >
                Generating battery model...
            </GenericDialog>
        </Card>
    );
};
