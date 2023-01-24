/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { Card, Toggle } from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../../features/pmicControl/pmicControlSlice';
import Battery, { batteryProps } from '../../Battery/Battery';

const BatteryCard: FC<batteryProps> = ({
    percent,
    pmicChargingState,
    batteryConnected,
    fuelGauge,
    disabled,
}) => {
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
                percent={percent}
                pmicChargingState={pmicChargingState}
                batteryConnected={batteryConnected}
                fuelGauge={fuelGauge}
                disabled={disabled}
            />
        </Card>
    );
};

export default BatteryCard;
