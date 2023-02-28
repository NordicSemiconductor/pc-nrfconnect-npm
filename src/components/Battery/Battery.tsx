/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import {
    AdcSample,
    PmicChargingState,
} from '../../features/pmicControl/npm/types';
import {
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
    return `${date
        .toISOString()
        .slice(11, 16)
        .split(':')
        .map(v => Number.parseInt(v, 10))
        .toString()
        .replace(',', 'hr ')}min`;
};

interface BatterySideTextProperties {
    batteryConnected: boolean;
    latestAdcSample?: AdcSample;
    fuelGauge: boolean;
}

const SideText = ({
    batteryConnected,
    latestAdcSample,
    fuelGauge,
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
                <h2>
                    {fuelGauge &&
                    latestAdcSample &&
                    !Number.isNaN(latestAdcSample.soc)
                        ? `${latestAdcSample.soc.toFixed(1) ?? 0}%`
                        : 'N/A %'}
                </h2>
                {latestAdcSample && !Number.isNaN(latestAdcSample.ttf) ? (
                    <div className="line-wrapper">
                        <span className="line-title">Time to full:</span>
                        <span className="line-data">
                            {latestAdcSample &&
                            !Number.isNaN(latestAdcSample.ttf)
                                ? `${formatSecondsToString(
                                      latestAdcSample.ttf
                                  )}`
                                : 'N/A'}
                        </span>
                    </div>
                ) : (
                    <div className="line-wrapper">
                        <span className="line-title">Time to empty:</span>
                        <span className="line-data">
                            {latestAdcSample &&
                            !Number.isNaN(latestAdcSample.tte)
                                ? `${formatSecondsToString(
                                      latestAdcSample.tte
                                  )}`
                                : 'N/A'}
                        </span>
                    </div>
                )}
            </>
        )}
    </div>
);

export interface BatteryProperties {
    disabled: boolean;
}
export default ({ disabled }: BatteryProperties) => {
    const [iconSize, setIconSize] = useState(0);
    const iconWrapper = useRef<HTMLDivElement | null>(null);

    const fuelGauge = useSelector(getFuelGauge);
    const pmicChargingState = useSelector(getPmicChargingState);
    const latestAdcSample = useSelector(getLatestAdcSample);
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
                                            fuelGauge &&
                                            batteryConnected &&
                                            !Number.isNaN(
                                                latestAdcSample?.soc ?? 0
                                            )
                                                ? latestAdcSample?.soc ?? 0
                                                : 0
                                        }% + 2px)`,
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
                    batteryConnected={batteryConnected}
                    latestAdcSample={latestAdcSample}
                    fuelGauge={fuelGauge}
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
