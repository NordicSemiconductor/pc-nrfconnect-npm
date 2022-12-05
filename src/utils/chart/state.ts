/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Chart } from 'chart.js';

export interface XAxisRange {
    xMin: number;
    xMax: number;
}

export interface PanPluginOptions {
    live: boolean;
    resolution: number;
    minResolution: number;
    zoomFactor: number;
    currentRange: XAxisRange;
}

export interface ChartActions {
    zoom: (resolution: number, centerOffset: number) => void;
}

interface ChartState {
    options: PanPluginOptions;
    actions: ChartActions;
}

const chartStates = new WeakMap<Chart, ChartState>();

export const getState = (chart: Chart) => {
    let state = chartStates.get(chart);
    if (!state) {
        state = {
            options: {
                live: true,
                resolution: 20000,
                minResolution: 1000,
                zoomFactor: 1.1,
                currentRange: { xMin: 0, xMax: 20000 },
            },
            actions: { zoom: () => {} },
        };
        chartStates.set(chart, state);
    }
    return state;
};

export const removeState = (chart: Chart) => {
    chartStates.delete(chart);
};
