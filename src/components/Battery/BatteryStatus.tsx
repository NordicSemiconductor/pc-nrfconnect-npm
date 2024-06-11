/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import {
    getLatestAdcSample,
    getNpmDevice,
    getPmicChargingState,
} from '../../features/pmicControl/pmicControlSlice';

import './battery.scss';

const LineData = ({
    title,
    value,
    docItem,
}: {
    title: string;
    value: string;
    docItem: string;
}) => (
    <div className="tw-flex tw-justify-between tw-border-b tw-border-b-gray-200 tw-pb-0.5 tw-text-xs">
        <DocumentationTooltip card="batteryStatus" item={docItem}>
            <span className="tw-font-medium">{title}</span>
        </DocumentationTooltip>
        <span className="tw-text-right">{value}</span>
    </div>
);

export default ({ disabled }: { disabled: boolean }) => {
    const npmDevice = useSelector(getNpmDevice);

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

    return (
        <div
            className={`tw-preflight tw-flex tw-flex-col tw-gap-0.5 ${classNames(
                disabled && 'tw-text-gray-300'
            )}`}
        >
            <LineData
                title="Voltage"
                value={
                    batteryConnected && latestAdcSample
                        ? `${latestAdcSample?.vBat.toFixed(2)} V`
                        : 'N/A'
                }
                docItem="Voltage"
            />

            <LineData
                title="Current"
                value={
                    batteryConnected &&
                    latestAdcSample?.iBat != null &&
                    !Number.isNaN(latestAdcSample?.iBat)
                        ? `${latestAdcSample?.iBat < 0 ? '—' : ''}${Math.round(
                              Math.abs(latestAdcSample?.iBat ?? 0)
                          )} mA`
                        : 'N/A'
                }
                docItem="Current"
            />

            <LineData
                title="Temperature"
                value={
                    batteryConnected && latestAdcSample
                        ? `${latestAdcSample?.tBat.toFixed(2)}°C`
                        : 'N/A'
                }
                docItem="Temperature"
            />

            {npmDevice?.hasCharger() && (
                <LineData
                    title="Charging Mode"
                    value={mode}
                    docItem="ChargingMode"
                />
            )}
        </div>
    );
};

export interface BatteryProperties {
    disabled: boolean;
}
