/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { MasonryLayout, PaneProps } from 'pc-nrfconnect-shared';

import {
    getBucks,
    getLdos,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const bucks = useSelector(getBucks);
    const ldos = useSelector(getLdos);

    return active ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={300}
        >
            {npmDevice &&
                bucks.map((buck, index) => (
                    <BuckCard
                        buck={buck}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
            {npmDevice &&
                ldos.map((ldo, index) => (
                    <LDOCard
                        ldo={ldo}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={disabled}
                    />
                ))}
        </MasonryLayout>
    ) : null;
};
