/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { Card, classNames } from '@nordicsemiconductor/pc-nrfconnect-shared';

import {
    getChargerError,
    getReserReason,
} from '../../features/pmicControl/pmicControlSlice';

const LineData = ({
    title,
    value,
}: // docItem,
{
    title: string;
    value: string;
    // docItem: string;
}) => (
    <div className="tw-flex tw-justify-between tw-border-b tw-border-b-gray-200 tw-pb-0.5 tw-text-xs">
        {/* <DocumentationTooltip card="batteryStatus" item={docItem}> */}
        <span className="tw-font-medium">{title}</span>
        {/* </DocumentationTooltip> */}
        <span className="tw-text-right">{value}</span>
    </div>
);

export default ({ disabled }: { disabled: boolean }) => {
    const resetReason = useSelector(getReserReason);
    const chargerError = useSelector(getChargerError);

    return (
        <Card title="Errors">
            <div
                className={`tw-preflight tw-flex tw-flex-col tw-gap-0.5 ${classNames(
                    disabled && 'tw-text-gray-300'
                )}`}
            >
                <LineData title="Reset Reason" value={resetReason ?? ''} />

                <LineData title="Charger Error" value={chargerError ?? ''} />
            </div>
        </Card>
    );
};
