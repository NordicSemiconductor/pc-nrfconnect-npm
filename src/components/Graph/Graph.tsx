/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import 'chartjs-adapter-date-fns';

import React, { useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import type { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';
import { useSelector } from 'react-redux';
import {
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions,
    Decimation,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Card, logger, PaneProps } from 'pc-nrfconnect-shared';

import {
    getIbatDataset,
    getTbatDataset,
    getVbatDataset,
} from '../../features/graph/graphSlice';
import zoomPanPlugin from '../../utils/chart.zoomPan';

import './graph.scss';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
    Decimation,
    zoomPanPlugin
);

export const options: ChartOptions<'line'> = {
    parsing: false,
    animation: false,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        // decimation: {
        //     algorithm: 'lttb',
        //     enabled: true,
        //     samples: 100,
        //     threshold: 40,
        // },
    },
    scales: {
        xAxis: {
            type: 'time',
            time: {
                unit: 'second',
                displayFormats: {
                    millisecond: 'HH:mm:ss',
                    second: 'HH:mm:ss',
                    minute: 'HH:mm',
                    hour: 'HH:mm',
                    day: 'HH:ss',
                },
            },
            ticks: {
                source: 'auto',
                autoSkip: true,
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

export const chartData: ChartData<'line'> = {
    datasets: [
        {
            label: 'Vbat',
            data: [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'yVbat',
        },
        {
            label: 'Tbat',
            data: [],
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            fill: false,
            cubicInterpolationMode: 'monotone',
            tension: 0.4,
            yAxisID: 'yTbat',
        },
        {
            label: 'Ibat',
            data: [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
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
    const datasetVbat = useSelector(getVbatDataset);
    const datasetTbat = useSelector(getTbatDataset);
    const datasetIbat = useSelector(getIbatDataset);

    useEffect(() => {
        if (chart) {
            chart.data.datasets[0].data = [...datasetVbat.data];
            chart.data.datasets[1].data = [...datasetTbat.data];
            chart.data.datasets[2].data = [...datasetIbat.data];
        }
    }, [chart, datasetIbat.data, datasetTbat.data, datasetVbat.data]);

    useEffect(() => {
        const t = setInterval(() => {
            chart?.update('none');
        }, 250);

        return () => clearInterval(t);
    }, [chart]);

    logger;

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {active && (
                <div className="graph-container">
                    <div className="graph">
                        <div className="graph-cards">
                            <Card title="Discharge Graph">
                                <Line
                                    height={600}
                                    options={options}
                                    data={chartData}
                                    ref={ref}
                                />
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
