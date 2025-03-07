/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import {
    MasonryLayout,
    PaneProps,
} from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import MaximumEnergyExtraction from '../Cards/MEE/MaximumEnergyExtractionCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);

    return active && npmDevice ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={422}
        >
            {npmDevice && npmDevice.hasMaxEnergyExtraction() && (
                <MaximumEnergyExtraction
                    npmDevice={npmDevice}
                    disabled={disabled}
                />
            )}
        </MasonryLayout>
    ) : null;
};
