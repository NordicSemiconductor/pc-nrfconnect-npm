/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { MasonryLayout } from 'pc-nrfconnect-shared';

import {
    getCharger,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import PowerCard from '../Cards/Power/PowerCard';
import Jeita from './Jeita';
import ThermalRegulation from './ThermalRegulation';

interface DashboardControlCardProps {
    disabled: boolean;
}
export default ({ disabled }: DashboardControlCardProps) => {
    const npmDevice = useSelector(getNpmDevice);
    const charger = useSelector(getCharger);

    return (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={420}
        >
            <BatteryCard disabled={disabled} />
            <BatteryStatusCard disabled={disabled} />
            {npmDevice && charger && (
                <PowerCard
                    npmDevice={npmDevice}
                    charger={charger}
                    cardLabel="Charger"
                    disabled={disabled}
                />
            )}
            {npmDevice && charger && (
                <Jeita
                    npmDevice={npmDevice}
                    charger={charger}
                    disabled={disabled}
                />
            )}
            {npmDevice && charger && (
                <ThermalRegulation
                    npmDevice={npmDevice}
                    charger={charger}
                    disabled={disabled}
                />
            )}
        </MasonryLayout>
    );
};
