/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    getLatestAdcSample,
    getPmicChargingState,
} from '../../features/pmicControl/pmicControlSlice';

import './battery.scss';

export default ({ disabled }: { disabled: boolean }) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);
    const card = 'batteryStatus';

    const pmicChargingState = useSelector(getPmicChargingState);
    const latestAdcSample = useSelector(getLatestAdcSample);
    const batteryConnected =
        latestAdcSample !== undefined && latestAdcSample?.vBat > 1;

    let mode = 'N/A';
    if (batteryConnected && pmicChargingState.constantCurrentCharging) {
        mode = 'Constant Current';
    } else if (batteryConnected && pmicChargingState.constantVoltageCharging) {
        mode = 'Constant Voltage';
    } else if (batteryConnected && pmicChargingState.trickleCharge) {
        mode = 'Trickle';
    }

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    return (
        <div className={`${disabled ? 'disabled' : ''}`}>
            <div className="line-wrapper">
                <DocumentationTooltip card={card} title="Voltage">
                    <span className="line-title">Voltage</span>
                </DocumentationTooltip>
                <span className="line-data">
                    {batteryConnected && latestAdcSample
                        ? `${latestAdcSample?.vBat.toFixed(2)}v`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <DocumentationTooltip card={card} title="Current">
                    <span className="line-title">Current</span>
                </DocumentationTooltip>
                <span className="line-data">
                    {batteryConnected && latestAdcSample
                        ? `${Math.round(latestAdcSample?.iBat)}mA`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <DocumentationTooltip card={card} title="Temperature">
                    <span className="line-title">Temperature</span>
                </DocumentationTooltip>
                <span className="line-data">
                    {batteryConnected && latestAdcSample
                        ? `${latestAdcSample?.tBat.toFixed(2)}°C`
                        : 'N/A'}
                </span>
            </div>
            <div className="line-wrapper">
                <DocumentationTooltip card={card} title="Charging Mode">
                    <span className="line-title">Charging Mode</span>
                </DocumentationTooltip>
                <span className="line-data">{mode}</span>
            </div>
        </div>
    );
};

export interface BatteryProperties {
    disabled: boolean;
}
