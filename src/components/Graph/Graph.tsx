/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import 'chartjs-adapter-date-fns';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useSelector } from 'react-redux';
import {
    CategoryScale,
    Chart,
    Chart as ChartJS,
    ChartArea,
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

import { AdcSample } from '../../features/pmicControl/npm/types';
import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import zoomPanPlugin from '../../utils/chart/chart.zoomPan';
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

const optionsSoc: ChartOptions<'line'> = {
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
        ySocBat: {
            type: 'linear',
            display: true,
            position: 'left',
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

const optionsTBat: ChartOptions<'line'> = {
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
        yTbat: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                callback(value) {
                    return ` ${value} °C`;
                },
            },
            suggestedMin: 0,
            suggestedMax: 150,
        },
    },
};

const optionsVBat: ChartOptions<'line'> = {
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
    },
};

const optionsIBat: ChartOptions<'line'> = {
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
        yIbat: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: {
                callback(value) {
                    return ` ${Number(value).toFixed(0)} mA`;
                },
                maxTicksLimit: 5,
            },
            suggestedMin: 0,
            suggestedMax: 1,
        },
    },
};

const chartDataSoc: ChartData<'line'> = {
    datasets: [
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

const chartDataVBat: ChartData<'line'> = {
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
    ],
};

const chartDataIBat: ChartData<'line'> = {
    datasets: [
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
    ],
};

const chartDataTBat: ChartData<'line'> = {
    datasets: [
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
    ],
};

export default ({ active }: PaneProps) => {
    const refIBat = useRef<ChartJSOrUndefined<'line'>>();
    const refTBat = useRef<ChartJSOrUndefined<'line'>>();
    const refVBat = useRef<ChartJSOrUndefined<'line'>>();
    const refSoc = useRef<ChartJSOrUndefined<'line'>>();

    const chartIBat = refIBat.current;
    const chartTBat = refTBat.current;
    const chartVBat = refVBat.current;
    const chartSoc = refSoc.current;

    const npmDevice = useSelector(getNpmDevice);
    const [isLive, setLive] = useState(true);
    const [range, setRange] = useState({ xMin: 0, xMax: 0 });
    const [chartAreaVBat, setChartCanvasVBat] = useState<ChartArea>();
    const [chartAreaIBat, setChartCanvasIBat] = useState<ChartArea>();
    const [chartAreaTBat, setChartCanvasTBat] = useState<ChartArea>();
    const [chartAreaSoc, setChartCanvasSoc] = useState<ChartArea>();

    const chartMetaData = useMemo(
        () => ({
            charts: [chartVBat, chartIBat, chartTBat, chartSoc],
            options: [optionsVBat, optionsIBat, optionsTBat, optionsSoc],
            data: [chartDataVBat, chartDataIBat, chartDataTBat, chartDataSoc],
            refs: [refVBat, refIBat, refTBat, refSoc],
            labels: ['Voltage', 'Current', 'Temperature', 'State of Charge'],
            chartArea: [
                { value: chartAreaVBat, setter: setChartCanvasVBat },
                { value: chartAreaIBat, setter: setChartCanvasIBat },
                { value: chartAreaTBat, setter: setChartCanvasTBat },
                { value: chartAreaSoc, setter: setChartCanvasSoc },
            ],
        }),
        [
            chartAreaIBat,
            chartAreaSoc,
            chartAreaTBat,
            chartAreaVBat,
            chartIBat,
            chartSoc,
            chartTBat,
            chartVBat,
        ]
    );

    chartMetaData.options.forEach((option, index) => {
        option.onResize = (c: Chart) => {
            setTimeout(() =>
                chartMetaData.chartArea[index].setter(c.chartArea)
            );
        };
    });

    useEffect(() => {
        if (npmDevice === undefined) {
            chartMetaData.charts.forEach(chart => {
                chart?.resetData();
            });
        }
    }, [chartMetaData.charts, npmDevice]);

    useEffect(() => {
        if (!npmDevice) return () => {};
        const releaseOnAdcSampleEvent = npmDevice.onAdcSample(sample => {
            // order is important
            const keys: (keyof AdcSample)[] = ['vBat', 'iBat', 'tBat', 'soc'];
            chartMetaData.charts.forEach((chart, index) => {
                const chartStates = chart ? getState(chart) : undefined;

                if (chart && chartStates) {
                    chart.addData([
                        [
                            {
                                x: sample.timestamp,
                                y: sample[keys[index]] ?? 0,
                            },
                        ],
                    ]);
                }
            });
        });

        return releaseOnAdcSampleEvent;
    }, [chartMetaData, active, npmDevice]);

    useEffect(() => {
        chartMetaData.charts.forEach(chart => {
            const chartStates = chart ? getState(chart) : undefined;
            const chartOptions = chartStates?.options;

            if (chartOptions && active) {
                chart?.setLive(isLive);
            }
        });
    }, [chartMetaData, isLive, active]);

    useEffect(() => {
        chartMetaData.charts.forEach(chart => {
            const chartStates = chart ? getState(chart) : undefined;

            if (chart && chartStates) {
                chartStates.options.onLiveChange = setLive;
                chartStates.options.onRangeChanged = r => {
                    setRange(r);
                    chartMetaData.charts.forEach(c => {
                        if (c !== chart) c?.pan(r);
                    });
                };
            }
        });
    }, [chartMetaData, range]);

    useEffect(() => {
        chartMetaData.charts.forEach(chart => {
            if (active && chart) {
                chart?.update('none');
            }
        });
    }, [chartMetaData, active]);

    const zoom = (resolution: number) => {
        chartMetaData.charts.forEach(chart => {
            const chartStates = chart ? getState(chart) : undefined;

            if (chart?.zoom) {
                const chartOptions = chartStates?.options;
                chart?.zoom(
                    resolution,
                    chartOptions?.live || resolution <= 0 ? 1 : 0.5
                );
            }
        });
    };

    return (
        <div className="graph-outer">
            <div className="graph-top-bar-wrapper">
                <div />
                <div className="range-buttons">
                    <Button
                        className="btn-primary w-100 h-100"
                        onClick={() => zoom(300000)}
                    >
                        5min
                    </Button>
                    <Button
                        className="btn-primary w-100 h-100"
                        onClick={() => zoom(1800000)}
                    >
                        30min
                    </Button>
                    <Button
                        className="btn-primary w-100 h-100"
                        onClick={() => zoom(3600000)}
                    >
                        1hr
                    </Button>
                    <Button
                        className="btn-primary w-100 h-100"
                        onClick={() => zoom(21600000)}
                    >
                        6hr
                    </Button>
                    <Button
                        className="btn-primary w-100 h-100"
                        onClick={() => zoom(86400000)}
                    >
                        1 Day
                    </Button>
                    <Button
                        className="btn-primary w-100 h-100"
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
            {chartMetaData.charts.map((_, index) => (
                // eslint-disable-next-line react/jsx-key
                <>
                    <div className="text-center">
                        <span>{chartMetaData.labels[index]}</span>
                    </div>
                    <div className="graph-container">
                        <Line
                            options={chartMetaData.options[index]}
                            data={chartMetaData.data[index]}
                            ref={chartMetaData.refs[index]}
                        />
                    </div>
                    <TimeSpanDeltaLine
                        range={range}
                        chartArea={chartMetaData.chartArea[index].value}
                    />
                </>
            ))}
        </div>
    );
};
