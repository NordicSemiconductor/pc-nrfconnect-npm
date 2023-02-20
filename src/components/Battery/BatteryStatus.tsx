/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
    getLatestAdcSample,
    getPmicChargingState,
} from '../../features/pmicControl/pmicControlSlice';

import './battery.scss';

export default () => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    const pmicChargingState = useSelector(getPmicChargingState);
    const latestAdcSample = useSelector(getLatestAdcSample);

    let mode = 'N/A';
    if (pmicChargingState.constantCurrentCharging) {
        mode = 'Constant Current';
    } else if (pmicChargingState.constantVoltageCharging) {
        mode = 'Constant Voltage';
    } else if (pmicChargingState.trickleCharge) {
        mode = 'Trickle';
    }

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    return (
        <div className="battery-side-panel">
            <div className="line-wrapper">
                <span className="line-title">Voltage:</span>
                <span className="line-data">
                    {latestAdcSample
                        ? `${latestAdcSample?.vBat.toFixed(2)}v`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <span className="line-title">Current:</span>
                <span className="line-data">
                    {latestAdcSample
                        ? `${Math.round(latestAdcSample?.iBat)}mA`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <span className="line-title">Temperature:</span>
                <span className="line-data">
                    {latestAdcSample
                        ? `${latestAdcSample?.tBat.toFixed(2)}°C`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <span className="line-title">Charging Mode:</span>
                <span className="line-data">{mode}</span>
            </div>
        </div>
    );
};

export interface BatteryProperties {
    disabled: boolean;
}
