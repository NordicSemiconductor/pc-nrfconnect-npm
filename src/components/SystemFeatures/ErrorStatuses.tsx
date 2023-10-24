/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Card, classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { getErrorLogs } from '../../features/pmicControl/pmicControlSlice';

export const LineData = ({
    title,
    value,
}: // docItem,
{
    title: string;
    value: string[] | undefined;
    // docItem: string;
}) => (
    <div className="tw-flex tw-justify-between tw-border-b tw-border-b-gray-200 tw-pb-0.5 tw-text-xs">
        {/* <DocumentationTooltip card="batteryStatus" item={docItem}> */}
        <span className="tw-font-medium tw-capitalize">{title}</span>
        {/* </DocumentationTooltip> */}
        <div className="tw-flex tw-flex-col tw-text-right">
            {value && value.length > 0
                ? value.map(item => <span key={item}>{item}</span>)
                : 'N/A'}
        </div>
    </div>
);

export default ({ disabled }: { disabled: boolean }) => {
    const errorLogs = useSelector(getErrorLogs);

    return (
        <Card
            title={<div className="tw-flex tw-justify-between">Error Logs</div>}
        >
            <div
                className={`tw-preflight tw-flex tw-flex-col tw-gap-0.5 ${classNames(
                    disabled && 'tw-text-gray-300'
                )}`}
            >
                <LineData title="Reset Cause" value={errorLogs?.resetCause} />
                <LineData
                    title="Charger Errors"
                    value={errorLogs?.chargerError}
                />
                <LineData
                    title="Sensor Errors"
                    value={errorLogs?.sensorError}
                />
            </div>
        </Card>
    );
};
