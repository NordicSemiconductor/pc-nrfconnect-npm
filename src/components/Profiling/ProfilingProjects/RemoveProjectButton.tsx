/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from 'pc-nrfconnect-shared';

import { removeRecentProject } from '../../../features/pmicControl/profilingProjectsSlice.';

export default ({ projectSettingsPath }: { projectSettingsPath: string }) => {
    const dispatch = useDispatch();
    return (
        <Button
            onClick={() => dispatch(removeRecentProject(projectSettingsPath))}
            variant="secondary"
        >
            Remove
        </Button>
    );
};
