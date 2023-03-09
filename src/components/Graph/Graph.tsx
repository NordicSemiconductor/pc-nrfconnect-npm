/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import 'chartjs-adapter-date-fns';

import React, { useEffect, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useSelector } from 'react-redux';
import {
    CategoryScale,
    Chart,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Button, PaneProps, Toggle } from 'pc-nrfconnect-shared';

import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import zoomPanPlugin from '../../utils/chart/chart.zoomPan';
import CustomLegend from '../../utils/chart/CustomLegend';
import highlightAxis from '../../utils/chart/highlightAxis';
import { getState } from '../../utils/chart/state';
import TimeSpanDeltaLine from '../../utils/chart/TimeSpanDeltaLine';

import './graph.scss';
import styles from './Graph.module.scss';

const getTimeString = (milliseconds: number): string => {
    const ms = milliseconds % 1000;

    milliseconds = Math.max((milliseconds - ms) / 1000, 0);
    const secs = milliseconds % 60;

    milliseconds = Math.max((milliseconds - secs) / 60, 0);
    const mins = milliseconds % 60;

    milliseconds = Math.max((milliseconds - mins) / 60, 0);
    const hrs = milliseconds % 60;

    milliseconds = Math.max((milliseconds - hrs) / 60, 0);
    const days = milliseconds % 24;

    const daysString = days > 0 ? `${days} days ` : '';
    return `${daysString}${hrs.toString().padStart(2, '0')}:${mins
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
        .toString()
        .padStart(3, '0')} `;
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    zoomPanPlugin,
    highlightAxis
);

const options: ChartOptions<'line'> = {
    parsing: false,
    animation: false,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            display: false,
        },
        tooltip: {
            callbacks: {
                title: context =>
                    `Uptime: ${getTimeString(context[0]?.parsed.x)}`,
            },
        },
    },
    scales: {
        x: {
            type: 'time',
            display: true,
            ticks: {
                autoSkip: false,
                maxTicksLimit: 5,
                display: false,
            },
        },
        yVbat: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                callback(value) {
                    return ` ${Number(value).toFixed(2)} V`;
                },
                maxTicksLimit: 5,
            },
            suggestedMin: 3,
            suggestedMax: 5,
        },
        yIbat: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                callback(value) {
                    return ` ${Number(value).toFixed(2)} mA`;
                },
                maxTicksLimit: 5,
            },
            suggestedMin: 0,
            suggestedMax: 1,
        },
        yTbat: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
                callback(value) {
                    return ` ${value} °C`;
                },
            },
            suggestedMin: 0,
            suggestedMax: 150,
        },
        ySocBat: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: {
                callback(value) {
                    return ` ${value} %`;
                },
            },
            suggestedMin: 0,
            suggestedMax: 100,
        },
    },
};

const chartData: ChartData<'line'> = {
    datasets: [
        {
            label: 'Vbat',
            data: [],
            borderColor: styles.indigo,
            backgroundColor: styles.indigo,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'yVbat',
        },
        {
            label: 'Tbat',
            data: [],
            borderColor: styles.red,
            backgroundColor: styles.red,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'yTbat',
        },
        {
            label: 'Ibat',
            data: [],
            borderColor: styles.amber,
            backgroundColor: styles.amber,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'yIbat',
        },
        {
            label: 'SOC',
            data: [],
            borderColor: styles.green,
            backgroundColor: styles.green,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'ySocBat',
        },
    ],
};

export default ({ active }: PaneProps) => {
    const ref = useRef<ChartJSOrUndefined<'line'>>();
    const chart = ref.current;
    const npmDevice = useSelector(getNpmDevice);
    const [isLive, setLive] = useState(true);
    const [range, setRange] = useState({ xMin: 0, xMax: 0 });
    const [chartArea, setChartCanvas] = useState(chart?.chartArea);

    options.onResize = (c: Chart) => {
        setTimeout(() => setChartCanvas(c.chartArea));
    };

    useEffect(() => {
        if (npmDevice) {
            chart?.resetData();
        }
    }, [chart, npmDevice]);

    useEffect(() => {
        if (!npmDevice) return () => {};
        const releaseOnAdcSampleEvent = npmDevice.onAdcSample(sample => {
            const chartStates = chart ? getState(chart) : undefined;

            if (chart && chartStates) {
                chart.addData([
                    [{ x: sample.timestamp, y: sample.vBat }],
                    [{ x: sample.timestamp, y: sample.tBat }],
                    [{ x: sample.timestamp, y: sample.iBat }],
                    [{ x: sample.timestamp, y: sample.soc ?? 0 }],
                ]);
            }
        });

        return releaseOnAdcSampleEvent;
    }, [chart, active, npmDevice]);

    useEffect(() => {
        const chartStates = chart ? getState(chart) : undefined;
        const chartOptions = chartStates?.options;

        if (chartOptions && active) {
            chart?.setLive(isLive);
        }
    }, [chart, isLive, active]);

    useEffect(() => {
        const chartStates = chart ? getState(chart) : undefined;

        if (chart && chartStates) {
            chartStates.options.onLiveChange = setLive;
            chartStates.options.onRangeChanged = setRange;
        }
    }, [chart]);

    useEffect(() => {
        if (active && chart) {
            chart?.update('none');
        }
    }, [chart, active]);

    const zoom = (resolution: number) => {
        const chartStates = chart ? getState(chart) : undefined;

        if (chart?.zoom) {
            const chartOptions = chartStates?.options;
            chart?.zoom(
                resolution,
                chartOptions?.live || resolution <= 0 ? 1 : 0.5
            );
        }
    };

    return (
        <div className="graph-outer">
            <div className="graph-top-bar-wrapper">
                <div />
                <div className="range-buttons">
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(300000)}
                    >
                        5min
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(1800000)}
                    >
                        30min
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(3600000)}
                    >
                        1hr
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(21600000)}
                    >
                        6hr
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(86400000)}
                    >
                        1 Day
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-100"
                        onClick={() => zoom(604800000)}
                    >
                        1 Week
                    </Button>
                </div>
                <div>
                    <Toggle
                        label="Live"
                        isToggled={isLive}
                        onToggle={value => setLive(value)}
                    />
                </div>
            </div>
            <CustomLegend chart={ref.current} />
            <div className="graph-container">
                <Line options={options} data={chartData} ref={ref} />
            </div>
            <TimeSpanDeltaLine range={range} chartArea={chartArea} />
        </div>
    );
};
