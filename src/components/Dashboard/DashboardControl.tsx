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
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import BoostCard from '../Cards/Boost/BoostCard';
import BuckCard from '../Cards/Buck/BuckCard';
import LDOCard from '../Cards/LDO/LDOCard';
import MaximumEnergyExtraction from '../Cards/MEE/MaximumEnergyExtractionCard';
import PowerCard from '../Cards/Power/PowerCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const charger = useSelector(getCharger);
    const bucks = useSelector(getBucks);
    const boosts = useSelector(getBoosts);
    const ldos = useSelector(getLdos);

    console.log(npmDevice?.hasMaxEnergyExtraction());

    return active ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={300}
        >
            <BatteryCard disabled={disabled} />
            <BatteryStatusCard disabled={disabled} />

            {npmDevice &&
                boosts.map((boost, index) => (
                    <BoostCard
                        boost={boost}
                        npmDevice={npmDevice}
                        key={`Boost${1 + index}`}
                        index={index}
                        disabled={disabled}
                        defaultSummary
                    />
                ))}
            {npmDevice && charger && (
                <PowerCard
                    npmDevice={npmDevice}
                    charger={charger}
                    cardLabel="Charger"
                    disabled={disabled}
                    defaultSummary
                />
            )}
            {npmDevice && npmDevice.hasMaxEnergyExtraction() && (
                <MaximumEnergyExtraction
                    npmDevice={npmDevice}
                    disabled={disabled}
                />
            )}
            {npmDevice &&
                bucks.map((buck, index) => (
                    <BuckCard
                        buck={buck}
                        npmDevice={npmDevice}
                        key={`Buck${1 + index}`}
                        index={index}
                        disabled={disabled}
                        defaultSummary
                    />
                ))}
            {npmDevice &&
                ldos.map((ldo, index) => (
                    <LDOCard
                        ldo={ldo}
                        npmDevice={npmDevice}
                        key={`Ldo${1 + index}`}
                        index={index}
                        disabled={disabled}
                        defaultSummary
                    />
                ))}
        </MasonryLayout>
    ) : null;
};
