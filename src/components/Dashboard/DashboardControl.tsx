/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { PaneProps } from 'pc-nrfconnect-shared';

import useIsUIDisabled from '../../features/useIsUIDisabled';
import DashboardControlCard from './DasboardControlCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();

    return !active ? null : (
        <div>
            <div>
                <DashboardControlCard disabled={disabled} />
            </div>
        </div>
    );
};
