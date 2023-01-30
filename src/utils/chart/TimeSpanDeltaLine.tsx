/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { ChartArea } from 'chart.js';

import { formatDuration } from './duration';
import { XAxisRange } from './state';

import './timeSpanDeltaLine.scss';

interface TimeSpanLineProps {
    range: XAxisRange;
    chartArea: ChartArea | undefined;
}

const TimeSpanDeltaLine: FC<TimeSpanLineProps> = ({ range, chartArea }) => {
    const duration = range.xMax - range.xMin;

    const label = `\u0394${formatDuration(duration)}`;

    return (
        <div
            className="time-delta-line"
            style={{
                width: `${chartArea?.width ?? 0}px`,
                position: 'relative',
                left: `${chartArea?.left ?? 0}px`,
            }}
        >
            <div className="content">
                <div className="start">
                    {formatDuration(Math.round(range.xMin))}
                </div>
                <div className="delta">{label}</div>
                <div className="end">
                    {formatDuration(Math.round(range.xMax))}
                </div>
            </div>
        </div>
    );
};

export default TimeSpanDeltaLine;
