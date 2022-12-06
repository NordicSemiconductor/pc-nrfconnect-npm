/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import { formatDuration } from './duration';
import { XAxisRange } from './state';

import './timeSpanDeltaLine.scss';

interface TimeSpanLineProps {
    range: XAxisRange;
}

const TimeSpanDeltaLine: FC<TimeSpanLineProps> = ({ range }) => {
    const duration = range.xMax - range.xMin;

    const label = `\u0394${formatDuration(duration * 1000)}`;

    return (
        <div className="time-delta-line">
            <div className="value">{label}</div>
        </div>
    );
};

export default TimeSpanDeltaLine;
