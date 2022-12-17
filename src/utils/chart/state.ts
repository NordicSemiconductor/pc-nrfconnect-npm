/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Chart, ScatterDataPoint } from 'chart.js';

export interface XAxisRange {
    xMin: number;
    xMax: number;
}

export type InternalPanPluginOptions = {
    live: boolean;
    resolution: number;
    minResolution: number;
    zoomFactor: number;
    currentRange: XAxisRange;
} & Required<PanPluginOptions>;

export interface PanPluginOptions {
    onLiveChange?: (live: boolean) => void;
    onRangeChanged?: (range: XAxisRange) => void;
}

interface ChartState {
    options: InternalPanPluginOptions;
    data: ScatterDataPoint[][];
}

export const defaults = {
    live: true,
    resolution: 20000,
    minResolution: 1000,
    zoomFactor: 1.1,
    currentRange: { xMin: 0, xMax: 20000 },
};

const chartStates = new WeakMap<Chart, ChartState>();

export const getState = (chart: Chart) => {
    let state = chartStates.get(chart);
    if (!state) {
        state = {
            options: {
                ...defaults,
                onLiveChange: () => {},
                onRangeChanged: () => {},
            },
            data: [],
        };
        chartStates.set(chart, state);
    }
    return state;
};

export const removeState = (chart: Chart) => {
    chartStates.delete(chart);
};
