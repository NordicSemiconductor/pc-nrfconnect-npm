/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { MasonryLayout } from 'pc-nrfconnect-shared';

import {
    getChargers,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import PowerCard from '../Cards/Power/PowerCard';

interface DashboardControlCardProps {
    disabled: boolean;
}
export default ({ disabled }: DashboardControlCardProps) => {
    const npmDevice = useSelector(getNpmDevice);
    const chargers = useSelector(getChargers);

    return (
        <MasonryLayout minWidth={300}>
            <BatteryCard disabled={disabled} />
            <BatteryStatusCard disabled={disabled} />
            {npmDevice &&
                chargers.map((charger, index) => (
                    <PowerCard
                        npmDevice={npmDevice}
                        charger={charger}
                        key={`Charger${1 + index}`}
                        index={index}
                        cardLabel="Charger"
                        disabled={disabled}
                    />
                ))}
        </MasonryLayout>
    );
};
