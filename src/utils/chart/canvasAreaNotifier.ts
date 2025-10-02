/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { Plugin } from 'chart.js';

export default {
    id: 'canvasAreaNotifier',
    afterLayout(chart) {
        if (chart.options.plugins?.canvasAreaNotifier?.onChartAreaChanged)
            chart.options.plugins.canvasAreaNotifier.onChartAreaChanged(
                chart.chartArea,
            );
    },
} as Plugin;
