/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ChartType,
    ChartTypeRegistry,
    Plugin,
    ScatterDataPoint,
} from 'chart.js';

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

    interface Chart<
        TType extends keyof ChartTypeRegistry = keyof ChartTypeRegistry
    > {
        zoom: (
            resolution: number,
            centerOffset: number,
            stickyAll?: boolean
        ) => void;
        addData: (data: ScatterDataPoint[][]) => void;
        resetData: () => void;
        setLive: (live: boolean) => void;
        pan: ({ xMin: number, xMax: number }) => void;
    }
}
