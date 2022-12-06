/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    CartesianScaleOptions,
    Chart,
    ChartDataset,
    Plugin,
    ScatterDataPoint,
} from 'chart.js';

import { getState, PanPluginOptions, removeState, XAxisRange } from './state';

const initRange = (chart: Chart) => {
    const options = getState(chart).options;
    const chartState = getState(chart);
    if (chartState.data.length === 0) {
        options.currentRange = { xMax: 0, xMin: 0 };
        return;
    }

    let hasData = true;
    chartState.data.forEach((data: ScatterDataPoint[]) => {
        if (hasData && data.length === 0) hasData = false;
    });

    if (!hasData) {
        options.currentRange = { xMax: 0, xMin: 0 };
        return;
    }

    options.currentRange = getRange(chartState.data, options);
};

const getX = (
    data: ScatterDataPoint[][],
    getValue: (d: ScatterDataPoint[]) => number
) => {
    const selection: number[] = [];

    data.forEach((d: ScatterDataPoint[]) => {
        selection.push(getValue(d));
    });

    selection.sort((a, b) => a - b);

    return selection.shift() || 0;
};

// Calulate Min from Data Backup
const getMinX = (data: ScatterDataPoint[][]) =>
    getX(data, (d: ScatterDataPoint[]) => {
        if (d.length > 0) {
            return (d[0] as ScatterDataPoint).x;
        }

        return 0;
    });

// Calulate Max from Data Backup
const getMaxX = (data: ScatterDataPoint[][]) =>
    getX(data, (d: ScatterDataPoint[]) => {
        if (d.length > 0) {
            return (d[d.length - 1] as ScatterDataPoint).x;
        }

        return 0;
    });

// Calulate Range from Data Backup
const getRange = (
    data: ScatterDataPoint[][],
    options: PanPluginOptions,
    live = options.live
) => {
    const max = getMaxX(data);
    const min = getMinX(data);

    if (live) {
        const xMax = max;
        const xMin = Math.max(min, max - options.resolution);
        return { xMin, xMax };
    }

    const xMin = min;
    const xMax = Math.min(max, min + options.resolution);
    return { xMin, xMax };
};

// Calulate if range is valid from when checked against the data backup
const isRangeValid = (
    data: ScatterDataPoint[][],
    rangeToCheck: XAxisRange,
    options: PanPluginOptions
) => {
    const xMax = getMaxX(data);
    const xMin = getMinX(data);

    const startValid = rangeToCheck.xMin >= xMin;
    const endValid = rangeToCheck.xMax <= xMax;

    return {
        valid: startValid && endValid,
        start: startValid,
        end: endValid,
        complete: rangeToCheck.xMax - rangeToCheck.xMin >= options.resolution,
    };
};

// We expact the raw data to be the in the dataset.data at this call
const mutateData = (data: ScatterDataPoint[], range: XAxisRange) => {
    let startIndex =
        data.findIndex((element: ScatterDataPoint) => element.x > range.xMin) -
        10;
    let endIndex = data.findIndex(
        (element: ScatterDataPoint) => element.x > range.xMax
    );

    // We need one extra element which is out of range to be able to show data
    // line going out of the graph on both sides

    startIndex = Math.max(startIndex, 0);
    endIndex =
        endIndex === -1
            ? data.length - 1
            : Math.min(endIndex + 10, data.length - 1);

    return data.slice(startIndex, endIndex);
};

const autoUpdateIsLive = (
    data: ScatterDataPoint[][],
    range: XAxisRange,
    options: PanPluginOptions,
    onLiveChange?: (live: boolean) => void
) => {
    const xMax = getMaxX(data);

    const old = options.live;

    options.live = xMax <= range.xMax;

    if (old !== options.live && onLiveChange) {
        onLiveChange(options.live);
    }

    if (options.live) {
        range = getRange(data, options);
    }
};

const updateRange = (
    chart: Chart,
    range: XAxisRange,
    options: PanPluginOptions
) => {
    const chartState = getState(chart);

    autoUpdateIsLive(
        chartState.data,
        range,
        options,
        chartState.actions.onLiveChange
    );

    const { valid } = isRangeValid(chartState.data, range, options);
    if (!valid) {
        range = getRange(chartState.data, options);
    }

    if (
        options.currentRange.xMax === range.xMax &&
        options.currentRange.xMin === range.xMin
    )
        return false;

    options.currentRange = { ...range };

    (chart.scales.xAxis.options as CartesianScaleOptions).min =
        chartState.options.currentRange.xMin;
    (chart.scales.xAxis.options as CartesianScaleOptions).max =
        chartState.options.currentRange.xMax;

    return true;
};

const isInChartArea = (chart: Chart, x: number, y: number) => {
    const ca = chart.chartArea;
    return x >= ca.left && x <= ca.right && y >= ca.top && y <= ca.bottom;
};

export default {
    id: 'pan',
    defaults: {
        live: true,
        resolution: 20000,
        minResolution: 1000,
        zoomFactor: 1.1,
        currentRange: { xMin: 0, xMax: 20000 },
    },
    start(chart, _args, options) {
        const state = getState(chart);
        state.options = options;
        state.actions.zoom = (resolution, offset) => {
            const resolutonDelta = resolution - options.resolution;
            options.resolution = resolution;

            const deltaMin = resolutonDelta * offset;
            const deltaMax = resolutonDelta - deltaMin;

            const nextRange = {
                xMin: options.currentRange.xMin - deltaMin,
                xMax: options.currentRange.xMax + deltaMax,
            };

            if (!updateRange(chart, nextRange, options)) {
                return;
            }

            chart.update('none');
        };
        state.actions.clearData = () => {
            state.data.forEach(d => d.splice(0));
            chart.update('none');
        };
        state.actions.addData = (data: ScatterDataPoint[][]) => {
            data.splice(state.data.length);
            state.data.forEach((d, index) => d.push(...data[index]));
            chart.update('none');
        };

        state.data = [];
        chart.data.datasets.forEach((dataset: ChartDataset) => {
            state.data.push([...(dataset.data as ScatterDataPoint[])]);
        });
    },
    afterInit(chart) {
        initRange(chart);

        const actions = getState(chart).actions;
        const options = getState(chart).options;
        const { canvas } = chart.ctx;

        let lastX = 0;
        let newX = 0;
        let paning = false;

        // Running avarage to smoth Scroll
        const alpha = 0.3;

        canvas.addEventListener('pointerdown', (event: PointerEvent) => {
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            lastX = event.offsetX - chart.chartArea.left;
            newX = lastX;

            paning = true;
        });

        window.addEventListener('pointerup', () => {
            paning = false;
        });

        canvas.addEventListener('pointermove', (event: PointerEvent) => {
            if (!paning) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            const currentNewX = event.offsetX - chart.chartArea.left;

            // Running avarage to smoth scrolls
            newX = alpha * currentNewX + (1.0 - alpha) * newX;

            const scaleDiff = lastX - newX;

            if (Math.abs(scaleDiff) < 1) return;

            const scaleDiffPercent = scaleDiff / chart.chartArea.width;
            const delta = options.resolution * scaleDiffPercent;

            let nextRange = {
                xMax: options.currentRange.xMax + delta,
                xMin: options.currentRange.xMax - options.resolution + delta,
            };

            const data = getState(chart).data;

            const { valid, end } = isRangeValid(data, nextRange, options);

            if (!valid) {
                nextRange = getRange(data, options, !end);
                lastX = newX;
            }

            if (!updateRange(chart, nextRange, options)) {
                return;
            }

            lastX = newX;

            chart.update('none');
        });

        canvas.addEventListener('wheel', (event: WheelEvent) => {
            if (event.deltaY === 0) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            let newResolution =
                event.deltaY < 0
                    ? options.resolution / options.zoomFactor // Zoom In
                    : options.resolution * options.zoomFactor; // Zoom out

            const data = getState(chart).data;

            const xMax = getMaxX(data);
            const xMin = getMinX(data);

            const fullResolution = xMax - xMin;

            newResolution = Math.round(
                Math.max(
                    options.minResolution,
                    Math.min(newResolution, fullResolution)
                )
            );

            // Zoom where the mouse pointer is
            const offset =
                (event.offsetX - chart.chartArea.left) / chart.chartArea.width;

            actions.zoom(newResolution, offset);
        });
    },
    beforeElementsUpdate(chart) {
        const chartState = getState(chart);

        let nextRange = { ...chartState.options.currentRange };

        if (chartState.options.live) {
            nextRange = getRange(chartState.data, chartState.options);
        }

        updateRange(chart, nextRange, chartState.options);

        chartState.data.forEach((data: ScatterDataPoint[], index: number) => {
            // Point the chart to the decimated data
            chart.data.datasets[index].data = mutateData(
                data,
                chartState.options.currentRange
            );
        });
    },
    stop(chart) {
        removeState(chart);
    },
} as Plugin<'scatter', PanPluginOptions>;
