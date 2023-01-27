/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Card, Toggle } from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import Battery, {
    BatteryProperties as BatteryCardProperties,
} from '../../Battery/Battery';

export default ({
    soc,
    pmicChargingState,
    batteryConnected,
    fuelGauge,
    disabled,
}: BatteryCardProperties) => {
    const npmDevice = useSelector(getNpmDevice);

    return (
        <Card
            title={
                <div
                    className={`d-flex justify-content-between ${
                        disabled ? 'disabled' : ''
                    }`}
                >
                    <span>Fuel Gauge</span>
                    <Toggle
                        label="Enable"
                        isToggled={fuelGauge}
                        onToggle={npmDevice?.setFuelGaugeEnabled}
                        disabled={disabled}
                    />
                </div>
            }
        >
            <Battery
                soc={soc}
                pmicChargingState={pmicChargingState}
                batteryConnected={batteryConnected}
                fuelGauge={fuelGauge}
                disabled={disabled}
            />
        </Card>
    );
};
