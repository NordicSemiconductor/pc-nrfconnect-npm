/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';

import { PmicChargingState } from '../../features/pmicControl/npm/types';

import './battery.scss';
import styles from './Battery.module.scss';

interface BatteryIconProperties {
    pmicChargingState: PmicChargingState;
}

const BatterIcon = ({ pmicChargingState }: BatteryIconProperties) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    const charging = isCharging(pmicChargingState);

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

interface BatterySideTextProperties {
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    soc: number | undefined;
    fuelGauge: boolean;
}

const SideText = ({
    pmicChargingState,
    batteryConnected,
    soc,
    fuelGauge,
}: BatterySideTextProperties) => (
    <div>
        <div className="battery-side-panel">
            {!batteryConnected && <h2>No Battery Connected</h2>}

            {batteryConnected && (
                <>
                    {fuelGauge && soc !== undefined ? (
                        <h2>{`${Math.round(soc ?? 0)}% soc`}</h2>
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

export interface BatteryProperties {
    soc: number | undefined;
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    fuelGauge: boolean;
    disabled: boolean;
}

export default ({
    soc,
    pmicChargingState,
    batteryConnected,
    fuelGauge,
    disabled,
}: BatteryProperties) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    const charging = isCharging(pmicChargingState);

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
                            height: `calc(${soc ?? 0}% + 8px)`,
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
                soc={soc}
                fuelGauge={fuelGauge}
            />
        </div>
    );
};

const isCharging = (pmicChargingState: PmicChargingState) =>
    (pmicChargingState.constantCurrentCharging ||
        pmicChargingState.constantVoltageCharging ||
        pmicChargingState.trickleCharge) &&
    !pmicChargingState.batteryFull;
