/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import { ChartType, Plugin } from 'chart.js';

declare module 'chart.js' {
    interface PluginOptionsByType<TType extends ChartType> {
        panZoom?: {
            live?: boolean;
            resolution?: number;
            minResolution?: number;
            zoomFactor?: number;
            currentRange?: { xMin: number; xMax: number };
        };
    }
}
