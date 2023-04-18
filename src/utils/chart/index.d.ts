/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    ChartArea,
    ChartType,
    ChartTypeRegistry,
    ScatterDataPoint,
} from 'chart.js';

declare module 'chart.js' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        panZoom?: {
            live?: boolean;
            resolution?: number;
            minResolution?: number;
            zoomFactor?: number;
            currentRange?: { xMin: number; xMax: number };
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface PluginOptionsByType<TType extends ChartType> {
        canvasAreaNotifier?: {
            onChartAreaChanged?: (chartArea: ChartArea) => void;
        };
    }

    interface Chart<
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        changeRange: ({ xMin: number, xMax: number }) => void;
    }
}
