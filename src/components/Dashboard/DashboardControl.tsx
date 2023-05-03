/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Alert, PaneProps } from 'pc-nrfconnect-shared';

import useIsUIDisabled from '../../features/useIsUIDisabled';
import DashboardControlCard from './DasboardControlCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();

    return !active ? null : (
        <div>
            <Alert variant="info" label="nPM PowerUP​ 0.1​ - Preview release! ">
                This is an unsupported, experimental preview and it is subject
                to major redesigns in the future.
            </Alert>
            <div>
                <DashboardControlCard disabled={disabled} />
            </div>
        </div>
    );
};
