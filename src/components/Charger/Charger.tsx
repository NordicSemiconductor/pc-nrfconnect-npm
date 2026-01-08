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
    getCharger,
    getNpmDevice,
} from '../../features/pmicControl/pmicControlSlice';
import useIsUIDisabled from '../../features/useIsUIDisabled';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import PowerCard from '../Cards/Power/PowerCard';
import Jeita from './Jeita';
import ThermalRegulation from './ThermalRegulation';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();
    const npmDevice = useSelector(getNpmDevice);
    const charger = useSelector(getCharger);

    return active && npmDevice?.chargerModule && charger ? (
        <MasonryLayout
            className="masonry-layout min-height-cards"
            minWidth={450}
        >
            <BatteryCard disabled={disabled} />
            <BatteryStatusCard disabled={disabled} />
            {npmDevice && charger && (
                <PowerCard
                    chargerModule={npmDevice.chargerModule}
                    charger={charger}
                    cardLabel="Charger"
                    disabled={disabled}
                />
            )}
            {npmDevice && charger && (
                <Jeita
                    chargerModule={npmDevice.chargerModule}
                    charger={charger}
                    disabled={disabled}
                />
            )}
            {npmDevice && charger && (
                <ThermalRegulation
                    chargerModule={npmDevice.chargerModule}
                    charger={charger}
                    disabled={disabled}
                />
            )}
        </MasonryLayout>
    ) : null;
};
