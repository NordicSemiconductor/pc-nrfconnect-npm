/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect, useRef, useState } from 'react';

import { PmicChargingState } from '../../features/pmicControl/npm/types';

import './battery.scss';
import styles from './Battery.module.scss';

interface batteryIconProps {
    pmicChargingState: PmicChargingState;
}

const BatterIcon: FC<batteryIconProps> = ({ pmicChargingState }) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    const charging =
        (pmicChargingState.constantCurrentCharging ||
            pmicChargingState.constantVoltageCharging ||
            pmicChargingState.trickleCharge) &&
        !pmicChargingState.batteryFull;

    const showIcon =
        charging ||
        pmicChargingState.batteryFull ||
        pmicChargingState.dieTempHigh;

    const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
    if (newIconSize !== iconSize) setIconSize(newIconSize);

    let icon = '';

    if (charging) icon = 'mdi-arrow-up-bold';
    else if (pmicChargingState.batteryFull) icon = 'mdi-check-bold';
    else if (pmicChargingState.dieTempHigh) icon = 'mdi-thermometer-high';

    return (
        <div
            ref={iconWrapper}
            className={`icon-wrapper ${showIcon ? '' : 'hidden'}`}
        >
            <span
                className={`mdi ${icon}`}
                style={{
                    fontSize: `${Math.round(iconSize)}px`,
                    color: styles.gray700,
                }}
            />
        </div>
    );
};

interface batterySideTextProps {
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    percent: number;
    fuelGauge: boolean;
}

const SideText: FC<batterySideTextProps> = ({
    pmicChargingState,
    batteryConnected,
    percent,
    fuelGauge,
}) => (
    <div>
        <div className="battery-side-panel">
            {!batteryConnected && <h2>No Battery Connected</h2>}

            {batteryConnected && (
                <>
                    {fuelGauge ? (
                        <h2>{`${percent}% soc`}</h2>
                    ) : (
                        <h2>Fuel Gauge Off</h2>
                    )}
                    {pmicChargingState.constantCurrentCharging && (
                        <span>Constant Current Charging</span>
                    )}
                    {pmicChargingState.constantVoltageCharging && (
                        <span>Constant Voltage Charging</span>
                    )}
                    {pmicChargingState.trickleCharge && (
                        <span>Trickle Charging</span>
                    )}
                    {pmicChargingState.batteryFull && <span>Battery Full</span>}
                    {pmicChargingState.dieTempHigh && (
                        <span>Battery Too Hot</span>
                    )}
                    {pmicChargingState.batteryRechargeNeeded && (
                        <span>Battery Recharge Needed</span>
                    )}
                </>
            )}
        </div>
    </div>
);

export interface batteryProps {
    percent: number;
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    fuelGauge: boolean;
    disabled: boolean;
}

const Battery: FC<batteryProps> = ({
    percent,
    pmicChargingState,
    batteryConnected,
    fuelGauge,
    disabled,
}) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    percent = Math.round(percent);

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    const charging =
        pmicChargingState.constantCurrentCharging ||
        pmicChargingState.constantVoltageCharging ||
        pmicChargingState.trickleCharge;

    const showPercent =
        pmicChargingState.batteryFull || charging || batteryConnected
            ? percent
            : 0;

    return (
        <div className={`battery-wrapper ${disabled ? 'disabled' : ''}`}>
            <div className="battery-graphic-wrapper">
                <div className="battery-nipple" />
                <div className="battery">
                    <div
                        className={`gauge ${charging ? 'animated' : ''} ${
                            charging ? 'charging' : ''
                        }`}
                        style={{
                            height: `calc(${showPercent}% + 8px)`,
                        }}
                    />
                </div>
                <div
                    className={`state-missing ${
                        !batteryConnected ? '' : 'hidden'
                    }`}
                />
                <BatterIcon pmicChargingState={pmicChargingState} />
            </div>
            <SideText
                pmicChargingState={pmicChargingState}
                batteryConnected={batteryConnected}
                percent={percent}
                fuelGauge={fuelGauge}
            />
        </div>
    );
};

export default Battery;
