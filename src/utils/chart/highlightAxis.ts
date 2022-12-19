/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    CartesianScaleOptions,
    ChartDataset,
    Plugin,
    ScriptableAndArray,
    ScriptableScaleContext,
} from 'chart.js';

type Color = string | CanvasGradient | CanvasPattern;

export default {
    id: 'highlightAxis',
    afterInit(chart) {
        const { canvas } = chart.ctx;
        canvas.addEventListener('pointermove', () => {
            if (
                chart.tooltip &&
                chart.tooltip.dataPoints &&
                chart.tooltip.dataPoints.length > 0
            ) {
                chart.tooltip.dataPoints = [];
                console.log('clear');

                (chart.data.datasets as ChartDataset<'line'>[]).forEach(d => {
                    if (d.yAxisID) {
                        const thisOptions = chart.scales[d.yAxisID]
                            .options as CartesianScaleOptions;
                        const ticks = thisOptions.ticks;

                        ticks.color = '#546e7a';
                    }
                });

                chart.update('none');
            }
        });
    },
    beforeDraw(chart) {
        if (
            !chart.tooltip?.dataPoints ||
            chart.tooltip?.dataPoints.length === 0
        )
            return;

        chart.tooltip?.dataPoints.forEach(d => {
            if (d.dataset.yAxisID) {
                const thisOptions = chart.scales[d.dataset.yAxisID]
                    .options as CartesianScaleOptions;

                const ticks = thisOptions.ticks;
                ticks.color = d.dataset.backgroundColor as ScriptableAndArray<
                    Color,
                    ScriptableScaleContext
                >;
            }
        });
    },
} as Plugin;
