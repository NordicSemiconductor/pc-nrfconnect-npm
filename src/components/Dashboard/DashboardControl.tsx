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
    getCharger,
    getLdos,
    getNpmDevice,
    getOnBoardLoad,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import BoostCard from '../Cards/Boost/BoostCard';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';
import OnBoardLoadCard from '../Cards/OnBoardLoad/OnBoardLoadCard';
import PowerCard from '../Cards/Power/PowerCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const charger = useSelector(getCharger);
    const onBoardLoad = useSelector(getOnBoardLoad);
    const bucks = useSelector(getBucks);
    const boosts = useSelector(getBoosts);
    const ldos = useSelector(getLdos);

    return active ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={300}
        >
            {npmDevice && [
                <BatteryCard key="BatteryCard" disabled={disabled} />,
                <BatteryStatusCard
                    key="BatteryStatusCard"
                    disabled={disabled}
                />,
            ]}

            {npmDevice &&
                boosts.map((boost, index) => (
                    <BoostCard
                        boost={boost}
                        boostModule={npmDevice.boostModule[index]}
                        key={`Boost${1 + index}`}
                        disabled={disabled}
                        defaultSummary
                    />
                ))}

            {npmDevice?.chargerModule && charger && (
                <PowerCard
                    chargerModule={npmDevice.chargerModule}
                    charger={charger}
                    cardLabel="Charger"
                    disabled={disabled}
                    defaultSummary
                />
            )}
            {npmDevice && npmDevice.onBoardLoadModule && onBoardLoad && (
                <OnBoardLoadCard
                    onBoardLoad={onBoardLoad}
                    onBoardLoadModule={npmDevice.onBoardLoadModule}
                    disabled={disabled}
                />
            )}
            {npmDevice &&
                bucks.map((buck, index) => (
                    <BuckCard
                        buck={buck}
                        buckModule={npmDevice.buckModule[index]}
                        key={`Buck${1 + index}`}
                        disabled={disabled}
                        defaultSummary
                        numberOfGPIOs={npmDevice.gpioModule.length}
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
                        key={`Ldo${1 + index}`}
                        disabled={disabled}
                        defaultSummary
                    />
                ))}
        </MasonryLayout>
    ) : null;
};
