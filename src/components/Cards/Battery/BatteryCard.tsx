/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Toggle } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../../features/pmicControl/npm/documentation/documentation';
import {
    getFuelGauge,
    getNpmDevice,
} from '../../../features/pmicControl/pmicControlSlice';
import Battery, {
    BatteryProperties as BatteryCardProperties,
} from '../../Battery/Battery';

export default ({ disabled }: BatteryCardProperties) => {
    const npmDevice = useSelector(getNpmDevice);
    const fuelGauge = useSelector(getFuelGauge);

    return (
        <Card
            title={
                <div className="tw-flex tw-justify-between">
                    <DocumentationTooltip card="battery" item="FuelGauge">
                        <span>Fuel Gauge</span>
                    </DocumentationTooltip>
                    <Toggle
                        label="Enable"
                        isToggled={fuelGauge}
                        onToggle={npmDevice?.setFuelGaugeEnabled}
                        disabled={disabled}
                    />
                </div>
            }
        >
            <Battery disabled={disabled} />
        </Card>
    );
};
