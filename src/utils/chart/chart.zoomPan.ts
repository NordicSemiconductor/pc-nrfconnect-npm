/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-underscore-dangle */

import type {
    CartesianScaleOptions,
    Chart,
    ChartDataset,
    Plugin,
    ScatterDataPoint,
} from 'chart.js';

import { getState, PanPluginOptions, removeState, XAxisRange } from './state';

let shouldMutate = false;

type CustomCharDataset = ChartDataset & {
    _simplified?: ChartDataset['data'];
} & {
    _rawData?: ChartDataset['data'];
};

const isNullOrUndef = (data: unknown) =>
    typeof data === 'undefined' || data === null;

const initRange = (chart: Chart) => {
    const options = getState(chart).options;
    if (chart.data.datasets.length === 0) {
        options.currentRange = { xMax: 0, xMin: 0 };
        return;
    }

    let hasData = true;
    chart.data.datasets.forEach((dataset: CustomCharDataset) => {
        if (hasData && dataset._rawData?.length === 0) hasData = false;
    });

    if (!hasData) {
        options.currentRange = { xMax: 0, xMin: 0 };
        return;
    }

    options.currentRange = getRange(chart.data.datasets, options);
};

const initData = (datasets: CustomCharDataset[]) => {
    datasets.forEach((dataset: Partial<CustomCharDataset>) => {
        const { _rawData } = dataset;
        const data = _rawData || dataset.data;

        if (isNullOrUndef(_rawData)) {
            // First time we are seeing this dataset
            // We override the 'data' property with a setter that stores the
            // raw data in _rawData, but reads the decimated data from _simplified
            dataset._rawData = data;
            delete dataset.data;
            Object.defineProperty(dataset, 'data', {
                configurable: true,
                enumerable: true,
                get() {
                    return this._simplified;
                },
                set(d) {
                    this._rawData = d;
                },
            });
        }
    });
};

const getX = (
    datasets: ChartDataset[],
    getValue: (dataset: ChartDataset) => number
) => {
    const selection: number[] = [];

    datasets.forEach((dataset: ChartDataset) => {
        selection.push(getValue(dataset));
    });

    selection.sort((a, b) => a - b);

    return selection.shift() || 0;
};

// Calulate Min from Data Backup
const getMinX = (datasets: CustomCharDataset[]) =>
    getX(datasets, (dataset: CustomCharDataset) => {
        if (dataset._rawData && dataset._rawData.length >= 0) {
            const data = dataset._rawData[0];
            if (data) {
                return (data as ScatterDataPoint).x;
            }
        }

        return 0;
    });

// Calulate Max from Data Backup
const getMaxX = (datasets: CustomCharDataset[]) =>
    getX(datasets, (dataset: CustomCharDataset) => {
        if (dataset._rawData && dataset._rawData.length >= 0) {
            const data = dataset._rawData[dataset._rawData.length - 1];
            if (data) {
                return (data as ScatterDataPoint).x;
            }
        }

        return 0;
    });

// Calulate Range from Data Backup
const getRange = (datasets: ChartDataset[], options: PanPluginOptions) => {
    const max = getMaxX(datasets);
    const min = getMinX(datasets);

    if (options.live) {
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
    datasets: ChartDataset[],
    rangeToCheck: XAxisRange,
    options: PanPluginOptions
) => {
    const xMax = getMaxX(datasets);
    const xMin = getMinX(datasets);

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
    endIndex = Math.min(
        (endIndex === -1 ? data.length : endIndex) + 10,
        data.length - 1
    );

    shouldMutate = false;
    return data.slice(startIndex, endIndex);
};

const autoUpdateIsLive = (
    datasets: ChartDataset[],
    range: XAxisRange,
    options: PanPluginOptions
) => {
    const xMax = getMaxX(datasets);

    range.xMax = Math.round(range.xMax);
    range.xMin = Math.round(range.xMin);

    options.live = xMax <= range.xMax;
    if (options.live) {
        range = getRange(datasets, options);
    }
};

const updateRange = (
    datasets: ChartDataset[],
    range: XAxisRange,
    options: PanPluginOptions
) => {
    range.xMax = Math.round(range.xMax);
    range.xMin = Math.round(range.xMin);

    const { valid } = isRangeValid(datasets, range, options);
    if (!valid) {
        range = getRange(datasets, options);
    }

    if (
        options.currentRange.xMax === range.xMax &&
        options.currentRange.xMin === range.xMin
    )
        return;

    shouldMutate = true;
    options.currentRange = { ...range };
};

const cleanBackedDatasets = (datasets: CustomCharDataset[]) => {
    datasets.forEach(dataset => {
        if (dataset._simplified) {
            const data = dataset._rawData;
            delete dataset._simplified;
            delete dataset._rawData;
            Object.defineProperty(dataset, 'data', { value: data });
        }
    });
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
    },
    afterInit(chart) {
        initData(chart.data.datasets);
        initRange(chart);

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

            if (scaleDiff === 0) return;

            const scaleDiffPercent = scaleDiff / chart.chartArea.width;
            const delta = options.resolution * scaleDiffPercent;

            lastX = newX;

            const nextRange = {
                xMax: options.currentRange.xMax + delta,
                xMin: options.currentRange.xMax - options.resolution + delta,
            };

            updateRange(chart.data.datasets, nextRange, options);
            autoUpdateIsLive(chart.data.datasets, nextRange, options);

            (chart.scales.xAxis.options as CartesianScaleOptions).min =
                options.currentRange.xMin;
            (chart.scales.xAxis.options as CartesianScaleOptions).max =
                options.currentRange.xMax;

            chart.update('none');
        });

        canvas.addEventListener('wheel', (event: WheelEvent) => {
            if (event.deltaY === 0) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            let newResolution =
                event.deltaY < 0
                    ? options.resolution / options.zoomFactor // Zoom In
                    : options.resolution * options.zoomFactor; // Zoom out

            const xMax = getMaxX(chart.data.datasets);
            const xMin = getMinX(chart.data.datasets);

            const fullResolution = xMax - xMin;

            newResolution = Math.round(
                Math.max(
                    options.minResolution,
                    Math.min(newResolution, fullResolution)
                )
            );

            const resolutonDelta = newResolution - options.resolution;
            options.resolution = newResolution;

            // Zoom where the mouse pointer is
            const offset =
                (event.offsetX - chart.chartArea.left) / chart.chartArea.width;

            const deltaMin = Math.ceil(resolutonDelta * offset);
            const deltaMax = resolutonDelta - deltaMin;

            const nextRange = {
                xMin: options.currentRange.xMin - deltaMin,
                xMax: options.currentRange.xMax + deltaMax,
            };

            updateRange(chart.data.datasets, nextRange, options);
            autoUpdateIsLive(chart.data.datasets, nextRange, options);

            (chart.scales.xAxis.options as CartesianScaleOptions).min =
                options.currentRange.xMin;
            (chart.scales.xAxis.options as CartesianScaleOptions).max =
                options.currentRange.xMax;

            chart.update('none');
        });
    },
    beforeElementsUpdate(chart) {
        const options = getState(chart).options;
        let nextRange = { ...options.currentRange };

        if (options.live) {
            nextRange = getRange(chart.data.datasets, options);
        }

        updateRange(chart.data.datasets, nextRange, options);

        (chart.scales.xAxis.options as CartesianScaleOptions).min =
            options.currentRange.xMin;
        (chart.scales.xAxis.options as CartesianScaleOptions).max =
            options.currentRange.xMax;

        if (!shouldMutate) {
            return;
        }

        chart.data.datasets.forEach((dataset: CustomCharDataset) => {
            const { _rawData } = dataset;
            const data = _rawData || dataset.data;

            // Point the chart to the decimated data
            dataset._simplified = mutateData(
                data as ScatterDataPoint[],
                options.currentRange
            );
        });
    },
    beforeDestroy(chart) {
        cleanBackedDatasets(chart.data.datasets);
    },
    stop(chart) {
        removeState(chart);
    },
} as Plugin<'scatter', PanPluginOptions>;
