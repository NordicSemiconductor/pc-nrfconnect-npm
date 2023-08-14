/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import 'chartjs-adapter-date-fns';

import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useSelector } from 'react-redux';
import {
    Button,
    PaneProps,
    Toggle,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import {
    CategoryScale,
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

import { DocumentationTooltip } from '../../features/pmicControl/npm/documentation/documentation';
import { AdcSample } from '../../features/pmicControl/npm/types';
import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
import canvasAreaNotifier from '../../utils/chart/canvasAreaNotifier';
import zoomPanPlugin from '../../utils/chart/chart.zoomPan';
import { getState } from '../../utils/chart/state';
import TimeSpanDeltaLine from '../../utils/chart/TimeSpanDeltaLine';

import './graph.scss';
import styles from './Graph.module.scss';

const yAxisWidth = parseInt(styles.yAxisWidthPx, 10);

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
    canvasAreaNotifier
);

const chartDataSoc: ChartData<'line'> = {
    datasets: [
        {
            label: 'Charge',
            data: [],
            borderColor: styles.green,
            backgroundColor: styles.green,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'y',
        },
    ],
};

const chartDataVBat: ChartData<'line'> = {
    datasets: [
        {
            label: 'Voltage',
            data: [],
            borderColor: styles.indigo,
            backgroundColor: styles.indigo,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'y',
        },
    ],
};

const chartDataIBat: ChartData<'line'> = {
    datasets: [
        {
            label: 'Current',
            data: [],
            borderColor: styles.amber,
            backgroundColor: styles.amber,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'y',
        },
    ],
};

const chartDataTBat: ChartData<'line'> = {
    datasets: [
        {
            label: 'Temperature',
            data: [],
            borderColor: styles.red,
            backgroundColor: styles.red,
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'y',
        },
    ],
};

const commonOption: ChartOptions<'line'> = {
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
            type: 'linear',
            display: true,
            ticks: {
                autoSkip: false,
                maxTicksLimit: 5,
                display: false,
            },
        },
    },
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
    const [chartArea, setChartCanvas] = useState<ChartArea>();

    const optionsSoc: ChartOptions<'line'> = useMemo(
        () => ({
            ...commonOption,
            plugins: {
                ...commonOption.plugins,
                canvasAreaNotifier: {
                    onChartAreaChanged: setChartCanvas,
                },
            },
            scales: {
                ...commonOption.scales,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback(value) {
                            return `${value} %`;
                        },
                        maxTicksLimit: 5,
                    },
                    grid: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => {
                        scale.width = yAxisWidth;
                    },
                },
            },
        }),
        []
    );

    const optionsTBat: ChartOptions<'line'> = useMemo(
        () => ({
            ...commonOption,
            scales: {
                ...commonOption.scales,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback(value) {
                            return `${Number(value).toFixed(2)}°C`;
                        },
                        maxTicksLimit: 5,
                    },
                    grid: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => {
                        scale.width = yAxisWidth;
                    },
                },
            },
        }),
        []
    );

    const optionsVBat: ChartOptions<'line'> = useMemo(
        () => ({
            ...commonOption,
            scales: {
                ...commonOption.scales,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback(value) {
                            return `${Number(value).toFixed(2)} V`;
                        },
                        maxTicksLimit: 5,
                    },
                    grid: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => {
                        scale.width = yAxisWidth;
                    },
                },
            },
        }),
        []
    );

    const optionsIBat: ChartOptions<'line'> = useMemo(
        () => ({
            ...commonOption,
            scales: {
                ...commonOption.scales,
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        callback(value) {
                            return `${Number(value).toFixed(0)} mA`;
                        },
                        maxTicksLimit: 5,
                    },
                    grid: {
                        drawBorder: true,
                        drawOnChartArea: true,
                    },
                    afterFit: scale => {
                        scale.width = yAxisWidth;
                    },
                },
            },
        }),
        []
    );

    const chartMetaData = useMemo(
        () => ({
            charts: [chartVBat, chartIBat, chartTBat, chartSoc],
            options: [optionsVBat, optionsIBat, optionsTBat, optionsSoc],
            data: [chartDataVBat, chartDataIBat, chartDataTBat, chartDataSoc],
            refs: [refVBat, refIBat, refTBat, refSoc],
            labels: ['Voltage', 'Current', 'Temperature', 'State of Charge'],
            tooltip: [
                { card: 'batteryStatus', item: 'Voltage' },
                { card: 'batteryStatus', item: 'Current' },
                { card: 'batteryStatus', item: 'Temperature' },
                { card: 'battery', item: 'StateOfCharge' },
            ],
        }),
        [
            chartIBat,
            chartSoc,
            chartTBat,
            chartVBat,
            optionsIBat,
            optionsSoc,
            optionsTBat,
            optionsVBat,
        ]
    );

    useEffect(() => {
        chartMetaData.charts.forEach(chart => {
            chart?.resetData();
        });
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
                chartStates.options.onLiveChange = live => {
                    setLive(live);
                    chartMetaData.charts.forEach(c => {
                        if (c !== chart) c?.setLive(live);
                    });
                };
                chartStates.options.onRangeChanged = r => {
                    setRange(r);
                    chartMetaData.charts.forEach(c => {
                        if (c !== chart) c?.changeRange(r);
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

    const resolution = range.xMax - range.xMin;

    return (
        <div className="graph-outer">
            <div className="graph-top-bar-wrapper">
                <div />
                <div className="range-buttons">
                    <Button
                        variant={
                            resolution === 300000 ? 'primary' : 'secondary'
                        }
                        onClick={() => zoom(300000)}
                    >
                        5min
                    </Button>
                    <Button
                        variant={
                            resolution === 1800000 ? 'primary' : 'secondary'
                        }
                        onClick={() => zoom(1800000)}
                    >
                        30min
                    </Button>
                    <Button
                        variant={
                            resolution === 3600000 ? 'primary' : 'secondary'
                        }
                        onClick={() => zoom(3600000)}
                    >
                        1hr
                    </Button>
                    <Button
                        variant={
                            resolution === 21600000 ? 'primary' : 'secondary'
                        }
                        onClick={() => zoom(21600000)}
                    >
                        6hr
                    </Button>
                    <Button
                        variant={
                            resolution === 86400000 ? 'primary' : 'secondary'
                        }
                        onClick={() => zoom(86400000)}
                    >
                        1 Day
                    </Button>
                    <Button
                        variant={
                            resolution === 604800000 ? 'primary' : 'secondary'
                        }
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
                <Fragment key={chartMetaData.labels[index]}>
                    <div className="d-flex justify-content-center">
                        <span>
                            <DocumentationTooltip
                                card={chartMetaData.tooltip[index].card}
                                item={chartMetaData.tooltip[index].item}
                                placement="right-start"
                            >
                                <strong>
                                    <u>{chartMetaData.labels[index]}</u>
                                </strong>
                            </DocumentationTooltip>
                        </span>
                    </div>
                    <div className="graph-container">
                        <Line
                            width={100 + 1}
                            options={chartMetaData.options[index]}
                            data={chartMetaData.data[index]}
                            ref={chartMetaData.refs[index]}
                        />
                    </div>
                </Fragment>
            ))}
            <TimeSpanDeltaLine range={range} chartArea={chartArea} />
        </div>
    );
};
