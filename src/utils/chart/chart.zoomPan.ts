/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    CartesianScaleOptions,
    Chart,
    Plugin,
    ScatterDataPoint,
} from 'chart.js';

import {
    defaults,
    getState,
    InternalPanPluginOptions,
    PanPluginOptions,
    removeState,
    XAxisRange,
} from './state';

const initRange = (chart: Chart) => {
    const chartState = getState(chart);
    const options = chartState.options;

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

const getMinX = (data: ScatterDataPoint[][]) =>
    getX(data, (d: ScatterDataPoint[]) => {
        if (d.length > 0) {
            return (d[0] as ScatterDataPoint).x;
        }

        return 0;
    });

const getMaxX = (data: ScatterDataPoint[][]) =>
    getX(data, (d: ScatterDataPoint[]) => {
        if (d.length > 0) {
            return (d[d.length - 1] as ScatterDataPoint).x;
        }

        return 0;
    });

const getRange = (
    data: ScatterDataPoint[][],
    options: InternalPanPluginOptions,
    live = options.live
) => {
    const max = getMaxX(data);
    const min = getMinX(data);

    if (live) {
        const xMax = max;
        const xMin = Math.max(
            min,
            max - getResolution(options.resolution, data)
        );
        return { xMin, xMax };
    }

    const xMin = min;
    const xMax = Math.min(max, min + getResolution(options.resolution, data));
    return { xMin, xMax };
};

const isRangeValid = (data: ScatterDataPoint[][], rangeToCheck: XAxisRange) => {
    const xMax = getMaxX(data);
    const xMin = getMinX(data);

    const startValid = rangeToCheck.xMin >= xMin;
    const endValid = rangeToCheck.xMax <= xMax;

    return {
        valid: startValid && endValid,
        end: endValid,
    };
};

// We expect the raw data to be the in the dataset.data at this call
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
        endIndex === -1 ? data.length : Math.min(endIndex + 10, data.length);

    return data.slice(startIndex, endIndex);
};

const autoUpdateIsLive = (
    data: ScatterDataPoint[][],
    range: XAxisRange,
    options: InternalPanPluginOptions
) => {
    const xMax = getMaxX(data);

    const old = options.live;

    options.live = xMax <= range.xMax || options.resolution <= 0;

    if (old !== options.live) {
        options.onLiveChange(options.live);
    }
};

const updateRange = (chart: Chart, range: XAxisRange) => {
    const chartState = getState(chart);

    autoUpdateIsLive(chartState.data, range, chartState.options);

    const { valid } = isRangeValid(chartState.data, range);
    if (!valid) {
        range = getRange(chartState.data, chartState.options);
    }

    if (
        chartState.options.currentRange.xMax === range.xMax &&
        chartState.options.currentRange.xMin === range.xMin
    )
        return false;

    chartState.options.onRangeChanged(range);
    chartState.options.currentRange = { ...range };

    (chart.scales.x.options as CartesianScaleOptions).min =
        chartState.options.currentRange.xMin;
    (chart.scales.x.options as CartesianScaleOptions).max =
        chartState.options.currentRange.xMax;

    return true;
};

const isInChartArea = (chart: Chart, x: number, y: number) => {
    const ca = chart.chartArea;
    return x >= ca.left && x <= ca.right && y >= ca.top && y <= ca.bottom;
};

const getResolution = (resolution: number, data: ScatterDataPoint[][]) => {
    if (resolution <= 0) {
        const min = getMinX(data);
        const max = getMaxX(data);

        return max - min;
    }

    return resolution;
};

export default {
    id: 'pan',
    defaults: {
        live: true,
        resolution: 300000,
        minResolution: 1000,
        maxResolution: 604800000,
        zoomFactor: 1.1,
        currentRange: { xMin: 0, xMax: 300000 },
    },
    start(chart, _args, pluginOptions) {
        {
            const state = getState(chart);
            state.options = { ...state.options, ...pluginOptions };
            state.data = [];
            chart.data.datasets.forEach(() => {
                state.data.push([]);
            });
        }

        chart.zoom = (resolution, offset = 0.5, stickyAll = false) => {
            const state = getState(chart);
            const data = state.data;
            const xMax = getMaxX(data);
            const xMin = getMinX(data);

            const fullResolution = xMax - xMin;

            const visibleDataResolution =
                state.options.currentRange.xMax -
                state.options.currentRange.xMin;

            if (
                resolution <= 0 ||
                (stickyAll && fullResolution === resolution)
            ) {
                state.options.resolution = 0;
            } else {
                // We always want to change to the resolution the user wants in the long run
                state.options.resolution = resolution;
            }

            if (
                fullResolution === visibleDataResolution &&
                visibleDataResolution === resolution
            ) {
                return;
            }

            const resolutionDelta = resolution - visibleDataResolution;

            const deltaMin = resolutionDelta * offset;
            const deltaMax = resolutionDelta - deltaMin;

            const nextRange = {
                xMin: state.options.currentRange.xMin - deltaMin,
                xMax: state.options.currentRange.xMax + deltaMax,
            };

            if (!updateRange(chart, nextRange)) {
                return;
            }

            chart.update('none');
        };
        chart.resetData = () => {
            const chartState = getState(chart);
            chartState.data.forEach(d => d.splice(0));

            chartState.options = { ...chartState.options, ...defaults };
            chartState.options.onRangeChanged(chartState.options.currentRange);

            chart.update('none');
        };
        chart.setLive = live => {
            const chartState = getState(chart);
            if (chartState.options.live === live) return;

            chartState.options.live = live;

            if (live) {
                chartState.options.resolution =
                    chartState.options.currentRange.xMax -
                    chartState.options.currentRange.xMin;
                const nextRange = getRange(chartState.data, chartState.options);

                if (updateRange(chart, nextRange)) {
                    chart.update('none');
                }
            }
        };
        chart.addData = (data: ScatterDataPoint[][]) => {
            const state = getState(chart);
            data.splice(state.data.length);
            state.data.forEach((d, index) => d.push(...data[index]));

            if (state.options.live) {
                const nextRange = getRange(state.data, state.options);
                if (updateRange(chart, nextRange)) {
                    chart.update('none');
                }
            }
        };
        chart.changeRange = range => {
            const chartState = getState(chart);

            if (chartState.options.live) {
                const newResolution = range.xMax - range.xMin;
                chartState.options.resolution = Math.max(
                    newResolution,
                    chartState.options.resolution
                );
                range = getRange(chartState.data, chartState.options);
            }

            if (
                chartState.options.currentRange.xMax === range.xMax &&
                chartState.options.currentRange.xMin === range.xMin
            )
                return;

            chartState.options.currentRange = { ...range };
            chartState.options.resolution = range.xMax - range.xMin;

            (chart.scales.x.options as CartesianScaleOptions).min =
                chartState.options.currentRange.xMin;
            (chart.scales.x.options as CartesianScaleOptions).max =
                chartState.options.currentRange.xMax;

            chart.update('none');
        };
    },
    afterInit(chart) {
        initRange(chart);
        const { canvas } = chart.ctx;

        let lastX = 0;
        let newX = 0;
        let panning = false;

        // Running average to smooth Scroll
        const alpha = 1;

        canvas.addEventListener('pointerdown', (event: PointerEvent) => {
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            lastX = event.offsetX - chart.chartArea.left;
            newX = lastX;

            panning = true;
        });

        window.addEventListener('pointerup', () => {
            panning = false;
        });

        canvas.addEventListener('pointermove', (event: PointerEvent) => {
            if (!panning) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            const state = getState(chart);
            const options = state.options;

            const currentNewX = event.offsetX - chart.chartArea.left;

            // Running average to smooth scrolls
            newX = alpha * currentNewX + (1.0 - alpha) * newX;

            const scaleDiff = lastX - newX;

            if (Math.abs(scaleDiff) < 1) return;

            const resolution = getResolution(options.resolution, state.data);

            const scaleDiffPercent = scaleDiff / chart.chartArea.width;
            const delta = resolution * scaleDiffPercent;

            const nextRange = {
                xMax: options.currentRange.xMax + delta,
                xMin: options.currentRange.xMax - resolution + delta,
            };

            lastX = newX;

            if (!updateRange(chart, nextRange)) {
                return;
            }

            chart.update('none');
        });

        canvas.addEventListener('wheel', (event: WheelEvent) => {
            if (event.deltaY === 0) return;
            if (!isInChartArea(chart, event.offsetX, event.offsetY)) return;

            const state = getState(chart);
            const options = state.options;
            const data = state.data;

            const xMax = getMaxX(data);
            const xMin = getMinX(data);

            const fullResolution = xMax - xMin;

            const resolution = getResolution(options.resolution, state.data);

            const delta = Math.min(
                Math.max(resolution * options.zoomFactor - resolution, 1000),
                60000 * 10
            ); // min zoom at 1 sec, max zoom 10 min per scroll

            let newResolution =
                event.deltaY < 0
                    ? resolution - delta // Zoom In
                    : resolution + delta; // Zoom out

            newResolution = Math.ceil(
                Math.max(
                    state.options.minResolution,
                    Math.min(
                        newResolution,
                        Math.min(fullResolution, state.options.maxResolution)
                    )
                )
            );

            // Zoom where the mouse pointer is
            const offset =
                (event.offsetX - chart.chartArea.left) / chart.chartArea.width;

            chart.zoom(newResolution, offset, true);
        });
    },
    beforeElementsUpdate(chart) {
        const chartState = getState(chart);

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
