/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    AdcSample,
    PmicChargingState,
} from '../../features/pmicControl/npm/types';
import {
    getFuelGaugeEnabled,
    getLatestAdcSample,
    getPmicChargingState,
    isBatteryConnected,
} from '../../features/pmicControl/pmicControlSlice';

import './battery.scss';
import styles from './Battery.module.scss';

const card = 'battery';

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
    const hrs = Math.floor(seconds / (60 * 60));
    const min = Math.floor((seconds - hrs * 60 * 60) / 60);
    return `${hrs}hr ${min.toString().padStart(2, '0')}min`;
};

interface BatterySideTextProperties {
    batteryConnected: boolean;
    latestAdcSample?: AdcSample;
    fuelGaugeEnabled: boolean;
}

const TimeToFullTimeToEmpty = (latestAdcSample: AdcSample) =>
    latestAdcSample?.ttf !== undefined &&
    !Number.isNaN(latestAdcSample?.ttf) ? (
        <div className="tw-flex tw-flex-col">
            <DocumentationTooltip card={card} item="TimeToFull">
                <span>Time to full</span>
            </DocumentationTooltip>
            <span>
                {!Number.isNaN(latestAdcSample?.ttf)
                    ? `${formatSecondsToString(latestAdcSample?.ttf)}`
                    : 'N/A'}
            </span>
        </div>
    ) : (
        <div className="tw-flex tw-flex-col">
            <DocumentationTooltip card={card} item="TimeToEmpty">
                <span>Time to empty</span>
            </DocumentationTooltip>
            <span>
                {latestAdcSample?.tte && !Number.isNaN(latestAdcSample?.tte)
                    ? `${formatSecondsToString(latestAdcSample?.tte)}`
                    : 'N/A'}
            </span>
        </div>
    );

const SideText = ({
    batteryConnected,
    latestAdcSample,
    fuelGaugeEnabled,
}: BatterySideTextProperties) => (
    <div className="battery-side-panel">
        {!batteryConnected && (
            <h2>
                Battery not
                <br />
                detected
            </h2>
        )}

        {batteryConnected && (
            <>
                <DocumentationTooltip card={card} item="StateOfCharge">
                    <h2>
                        {fuelGaugeEnabled &&
                        latestAdcSample &&
                        !Number.isNaN(latestAdcSample.soc)
                            ? `${latestAdcSample.soc ?? 0}%`
                            : 'N/A %'}
                    </h2>
                </DocumentationTooltip>

                {latestAdcSample?.ttf !== undefined ||
                latestAdcSample?.tte !== undefined ? (
                    TimeToFullTimeToEmpty(latestAdcSample)
                ) : (
                    <div className="tw-flex tw-flex-col" />
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

    const fuelGaugeEnabled = useSelector(getFuelGaugeEnabled);
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
                                            fuelGaugeEnabled &&
                                            batteryConnected &&
                                            !Number.isNaN(
                                                latestAdcSample?.soc ?? 0,
                                            )
                                                ? (latestAdcSample?.soc ?? 0)
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
                    fuelGaugeEnabled={fuelGaugeEnabled}
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
