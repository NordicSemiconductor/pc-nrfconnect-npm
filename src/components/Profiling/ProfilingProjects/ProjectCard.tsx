/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert, Card } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { ProfilingProject } from '../types';
import ProfileComponent from './ProfileComponent';
import ProjectCardMenu from './ProjectCardMenu';

export default ({
    projectSettingsPath,
    settings,
}: {
    projectSettingsPath: string;
    settings: ProfilingProject;
}) => (
    <Card
        title={
            <div className="d-flex justify-content-between">
                <div className="d-flex align-items-center">
                    <span>
                        <span>{`${settings.name}`}</span>
                        <span className="font-weight-normal">
                            {` - ${settings.capacity} mAh, V`}
                            <span className="subscript">TERM</span>
                            {` ${settings.vUpperCutOff} V,  Discharge cut-off voltage ${settings.vLowerCutOff} V.`}
                        </span>
                    </span>
                </div>
                <div>
                    <ProjectCardMenu
                        projectSettingsPath={projectSettingsPath}
                        project={settings}
                    />
                </div>
            </div>
        }
    >
        {settings.profiles.length === 0 && (
            <Alert variant="info" label="Note: ">
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
    </Card>
);
