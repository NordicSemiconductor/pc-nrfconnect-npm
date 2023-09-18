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

import {
    getGPIOs,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import GPIO from '../GPIO/GPIO';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const gpios = useSelector(getGPIOs);

    return active ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={300}
        >
            {npmDevice &&
                gpios.map((gpio, index) => (
                    <GPIO
                        gpio={gpio}
                        npmDevice={npmDevice}
                        key={`GPIO${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
        </MasonryLayout>
    ) : null;
};
