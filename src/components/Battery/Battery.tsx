/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
    AdcSample,
    BatteryModel,
    PmicChargingState,
} from '../../features/pmicControl/npm/types';
import {
    getActiveBatterModel,
    getFuelGauge,
    getLatestAdcSample,
    getPmicChargingState,
    isBatteryConnected,
} from '../../features/pmicControl/pmicControlSlice';

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

const formatSecondsToString = (seconds: number) => {
    const date = new Date(0);
    date.setSeconds(seconds); // specify value for SECONDS here
    return date.toISOString().slice(11, 19);
};

interface BatterySideTextProperties {
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    latestAdcSample?: AdcSample;
    fuelGauge: boolean;
    activeBatteryModel?: BatteryModel;
}

const SideText = ({
    pmicChargingState,
    batteryConnected,
    latestAdcSample,
    fuelGauge,
    activeBatteryModel,
}: BatterySideTextProperties) => (
    <div className="battery-side-panel">
        {!batteryConnected && (
            <h2>
                No Battery
                <br />
                Connected
            </h2>
        )}

        {batteryConnected && (
            <>
                {fuelGauge &&
                latestAdcSample &&
                !Number.isNaN(latestAdcSample.soc) ? (
                    <h2>{`${Math.round(latestAdcSample.soc ?? 0)}%`}</h2>
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
                {pmicChargingState.dieTempHigh && <span>Battery Too Hot</span>}
                {pmicChargingState.batteryRechargeNeeded && (
                    <span>Battery Recharge Needed</span>
                )}
                {latestAdcSample && !Number.isNaN(latestAdcSample.tte) && (
                    <span>
                        {` Time to empty: ${formatSecondsToString(
                            latestAdcSample.tte
                        )}`}
                    </span>
                )}
                {latestAdcSample && !Number.isNaN(latestAdcSample.ttf) && (
                    <span>
                        {` Time to full: ${formatSecondsToString(
                            latestAdcSample.ttf
                        )}`}
                    </span>
                )}
                {latestAdcSample && (
                    <div>
                        <span>{`Temperature: ${latestAdcSample?.tBat.toFixed(
                            2
                        )}°C`}</span>
                        <br />
                        <span>{`Current: ${Math.round(
                            latestAdcSample?.iBat
                        )}mA`}</span>
                        <br />
                        <span>{`Voltage: ${latestAdcSample?.vBat.toFixed(
                            2
                        )}v`}</span>
                        <br />
                    </div>
                )}
                {activeBatteryModel && latestAdcSample && (
                    <div>
                        {`Capacity: ${
                            getClosest(activeBatteryModel, latestAdcSample.tBat)
                                .capacity
                        }
                            mAh`}
                    </div>
                )}
            </>
        )}
    </div>
);

export interface BatteryProperties {
    disabled: boolean;
}

const getClosest = (batteryModel: BatteryModel, temperature: number) =>
    batteryModel.characterizations.reduce((prev, curr) =>
        Math.abs(curr.temperature - temperature) <
        Math.abs(prev.temperature - temperature)
            ? curr
            : prev
    );

export default ({ disabled }: BatteryProperties) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    const fuelGauge = useSelector(getFuelGauge);
    const pmicChargingState = useSelector(getPmicChargingState);
    const latestAdcSample = useSelector(getLatestAdcSample);
    const activeBatteryModel = useSelector(getActiveBatterModel);
    const batteryConnected = useSelector(isBatteryConnected);

    useEffect(() => {
        const newIconSize = (iconWrapper.current?.clientHeight ?? 20) * 0.9;
        if (newIconSize !== iconSize) setIconSize(newIconSize);
    }, [iconSize]);

    const charging = isCharging(pmicChargingState);

    return (
        <div className={`battery ${disabled ? 'disabled' : ''}`}>
            <div className="battery-wrapper">
                <div className="battery-graphic-wrapper">
                    <div className="battery-graphic-wrapper-wrapper">
                        <div className="battery-graphic">
                            <div className="battery-nipple" />
                            <div className="battery">
                                <div
                                    className={`gauge ${
                                        charging ? 'animated' : ''
                                    } ${charging ? 'charging' : ''}`}
                                    style={{
                                        height: `calc(${
                                            latestAdcSample?.soc ?? 0
                                        }% + 8px)`,
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
                    </div>
                </div>
                <SideText
                    pmicChargingState={pmicChargingState}
                    batteryConnected={batteryConnected}
                    latestAdcSample={latestAdcSample}
                    fuelGauge={fuelGauge}
                    activeBatteryModel={activeBatteryModel}
                />
            </div>
        </div>
    );
};

const isCharging = (pmicChargingState: PmicChargingState) =>
    (pmicChargingState.constantCurrentCharging ||
        pmicChargingState.constantVoltageCharging ||
        pmicChargingState.trickleCharge) &&
    !pmicChargingState.batteryFull;
