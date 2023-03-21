/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { MasonryLayout } from 'pc-nrfconnect-shared';

import {
    getBucks,
    getChargers,
    getLdos,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';

interface DashboardControlCardProps {
    disabled: boolean;
}
export default ({ disabled }: DashboardControlCardProps) => {
    const npmDevice = useSelector(getNpmDevice);
    const bucks = useSelector(getBucks);
    const ldos = useSelector(getLdos);

    return (
        <MasonryLayout minWidth={300}>
            {bucks.map((buck, index) => (
                <BuckCard
                    buck={buck}
                    npmDevice={npmDevice}
                    key={`Buck${1 + index}`}
                    index={index}
                    disabled={disabled}
                />
            ))}
            {ldos.map((ldo, index) => (
                <LDOCard
                    ldo={ldo}
                    npmDevice={npmDevice}
                    key={`Buck${1 + index}`}
                    index={index}
                    disabled={disabled}
                />
            ))}
        </MasonryLayout>
    );
};
