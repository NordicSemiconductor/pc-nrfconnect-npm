/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { MasonryLayout, PaneProps } from 'pc-nrfconnect-shared';

import useIsUIDisabled from '../../features/useIsUIDisabled';
import BatteryCard from '../Cards/Battery/BatteryCard';
import BatteryStatusCard from '../Cards/Battery/BatteryStatusCard';
import FuelGaugeSettingsCard from '../Cards/FuelGauge/FuelGaugeSettingsCard';

export default ({ active }: PaneProps) => {
    const disabled = useIsUIDisabled();

    return !active ? null : (
        <div>
            <div>
                <MasonryLayout
                    className="masonry-layout min-height-cards"
                    minWidth={300}
                >
                    <FuelGaugeSettingsCard disabled={disabled} />
                    <BatteryCard disabled={disabled} />
                    <BatteryStatusCard disabled={disabled} />
                </MasonryLayout>
            </div>
        </div>
    );
};
