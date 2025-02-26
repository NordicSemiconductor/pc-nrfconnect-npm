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
    getBoosts,
    getBucks,
    getLdos,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import BoostCard from '../Cards/Boost/BoostCard';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const bucks = useSelector(getBucks);
    const boosts = useSelector(getBoosts);
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
                        buckModule={npmDevice.buckModule[index]}
                        key={`Buck${1 + index}`}
                        disabled={disabled}
                        numberOfGPIOs={npmDevice.gpioModule.length}
                    />
                ))}
            {npmDevice &&
                boosts.map((boost, index) => (
                    <BoostCard
                        boost={boost}
                        boostModule={npmDevice.boostModule[index]}
                        key={`Boost${1 + index}`}
                        disabled={disabled}
                    />
                ))}
            {npmDevice &&
                ldos.map((ldo, index) => (
                    <LDOCard
                        ldo={ldo}
                        ldoModule={npmDevice.ldoModule[index]}
                        cardLabel={
                            ldos.length === 1 ? `Load Switch/LDO` : undefined
                        }
                        deviceType={npmDevice.deviceType}
                        key={`Buck${1 + index}`}
                        disabled={disabled}
                    />
                ))}
        </MasonryLayout>
    ) : null;
};
