/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import 'chartjs-adapter-date-fns';

import React, { useEffect, useRef, useState } from 'react';
// eslint-disable-next-line import/no-unresolved
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
import { Button, Card, PaneProps, Toggle } from 'pc-nrfconnect-shared';

import { getShellParser } from '../../features/modem/modemSlice';
import zoomPanPlugin from '../../utils/chart/chart.zoomPan';
import { getState } from '../../utils/chart/state';
import TimeSpanDeltaLine from '../../utils/chart/TimeSpanDeltaLine';

import './graph.scss';
import styles from './Graph.module.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    zoomPanPlugin
);

const options: ChartOptions<'line'> = {
    parsing: false,
    animation: false,
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            callbacks: {
                title: context => {
                    let label = 'Uptime: ';

                    if (context[0]?.parsed.x !== null) {
                        let uptimeMiliseconds = context[0].parsed.x;

                        const ms = uptimeMiliseconds % 1000;

                        uptimeMiliseconds = Math.max(
                            (uptimeMiliseconds - ms) / 1000,
                            0
                        );
                        const secs = uptimeMiliseconds % 60;

                        uptimeMiliseconds = Math.max(
                            (uptimeMiliseconds - secs) / 60,
                            0
                        );
                        const mins = uptimeMiliseconds % 60;

                        uptimeMiliseconds = Math.max(
                            (uptimeMiliseconds - mins) / 60,
                            0
                        );
                        const hrs = uptimeMiliseconds % 60;

                        uptimeMiliseconds = Math.max(
                            (uptimeMiliseconds - hrs) / 60,
                            0
                        );
                        const days = uptimeMiliseconds % 24;

                        label += days !== 0 ? `${days} days ` : '';
                        label += `${hrs.toString().padStart(2, '0')}:${mins
                            .toString()
                            .padStart(2, '0')}:${secs
                            .toString()
                            .padStart(2, '0')}.${ms
                            .toString()
                            .padStart(3, '0')} `;
                    }
                    return label;
                },
            },
        },
    },
    scales: {
        xAxis: {
            type: 'time',
            display: true,
            ticks: {
                autoSkip: false,
                maxTicksLimit: 5,
                display: false,
            },
            grid: {
                display: true,
                drawOnChartArea: true,
            },
        },
        yVbat: {
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
                drawOnChartArea: true,
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
                    return `${Number(value).toFixed(2)} mA`;
                },
                maxTicksLimit: 5,
            },
            grid: {
                drawOnChartArea: true,
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
                    return `${value} °C`;
                },
            },
            suggestedMin: 0,
            suggestedMax: 150,
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
    ],
};

export default ({ active }: PaneProps) => {
    const ref = useRef<ChartJSOrUndefined<'line'>>();
    const chart = ref.current;
    const shellParser = useSelector(getShellParser);
    const [isLive, setLive] = useState(true);
    const [range, setRange] = useState({ xMin: 0, xMax: 0 });
    const [hoursOverflowCounter, setHoursOverflowCounter] = useState(0);
    const [lastHour, setLastHour] = useState(0);
    const [initUptime, setInitUptime] = useState<number | null>(null);

    const [chartArea, setChartCanvas] = useState(chart?.chartArea);

    options.onResize = (c: Chart) => {
        setTimeout(() => setChartCanvas(c.chartArea));
    };

    useEffect(() => {
        if (shellParser) {
            const chartStates = chart ? getState(chart) : undefined;
            chartStates?.actions.clearData();
            setHoursOverflowCounter(0);
            setLastHour(0);
            setInitUptime(null);
        }
    }, [chart, shellParser]);

    useEffect(() => {
        if (!shellParser) return () => {};
        const relaseShellLoggingEvent = shellParser.onShellLoggingEvent(
            data => {
                const chartStates = chart ? getState(chart) : undefined;
                const splitData = data.split(' <inf> main:');

                const variables = splitData[1].trim().split(',');
                const time = splitData[0]
                    .trim()
                    .replace('[', '')
                    .replace(']', '')
                    .split(',')[0]
                    .replace('.', ':')
                    .split(':');

                const v = Number(variables[0].split('=')[1]);
                const i = Number(variables[1].split('=')[1]);

                const msec = Number(time[3]);
                const sec = Number(time[2]) * 1000;
                const min = Number(time[1]) * 1000 * 60;
                let hr =
                    (Number(time[0]) + hoursOverflowCounter * 99) *
                    1000 *
                    60 *
                    60;

                // We have wrapped 99 hours incriment counter
                if (hr < lastHour) {
                    setHoursOverflowCounter(hoursOverflowCounter + 1);
                    hr += 99;
                }

                if (hr !== lastHour) {
                    setLastHour(hr);
                }

                let timestamp = msec + sec + min + hr;

                if (initUptime === null) {
                    setInitUptime(timestamp);
                    timestamp = 0;
                } else {
                    timestamp -= initUptime;
                }

                if (chart && chartStates) {
                    chartStates.actions.addData([
                        [{ x: timestamp, y: v }],
                        [{ x: timestamp, y: 50 }],
                        [{ x: timestamp, y: i }],
                    ]);
                }
            }
        );

        return relaseShellLoggingEvent;
    }, [
        chart,
        active,
        shellParser,
        hoursOverflowCounter,
        lastHour,
        initUptime,
    ]);

    useEffect(() => {
        const chartStates = chart ? getState(chart) : undefined;
        const chartOptions = chartStates?.options;

        if (chartOptions && active) {
            chartStates.actions.setLive(isLive);
        }
    }, [chart, isLive, active]);

    useEffect(() => {
        const chartStates = chart ? getState(chart) : undefined;

        if (chart && chartStates) {
            chartStates.actions.onLiveChange = setLive;
            chartStates.actions.onRangeChanged = setRange;
        }
    }, [chart]);

    useEffect(() => {
        if (active && chart) {
            chart?.update('none');
        }
    }, [chart, active]);

    const zoom = (resolution: number) => {
        const chartStates = chart ? getState(chart) : undefined;
        const chartActons = chartStates?.actions;

        if (chartActons?.zoom) {
            const chartOptions = chartStates?.options;
            chartActons?.zoom(resolution, chartOptions?.live ? 1 : 0.5);
        }
    };

    return (
        <div className="graph-container">
            <div className="graph">
                <div className="graph-cards">
                    <Card title="Discharge Graph">
                        <div className="graph-top-bar-wrapper">
                            <div />
                            <div className="range-buttons">
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(10)}
                                >
                                    10ms
                                </Button>
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(100)}
                                >
                                    100ms
                                </Button>
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(1000)}
                                >
                                    1s
                                </Button>
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(3000)}
                                >
                                    3s
                                </Button>
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(10000)}
                                >
                                    10s
                                </Button>
                                <Button
                                    className="btn-primary w-100 h-100"
                                    onClick={() => zoom(60000)}
                                >
                                    1min
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
                        <Line
                            height="100vh"
                            options={options}
                            data={chartData}
                            ref={ref}
                        />
                        <TimeSpanDeltaLine
                            range={range}
                            chartArea={chartArea}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};
