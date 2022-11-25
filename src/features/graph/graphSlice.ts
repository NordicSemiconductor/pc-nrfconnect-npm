/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ScatterDataPoint } from 'chart.js';

import type { RootState } from '../../appReducer';

interface Data {
    data: ScatterDataPoint[];
    unit: string;
    label: string;
}

interface ChartLoggedData {
    datasetVbat: Data;
    datasetIbat: Data;
    datasetTbat: Data;
    vBatYAxisRange?: DatasetAxisRange;
    tBatYAxisRange?: DatasetAxisRange;
    iBatYAxisRange?: DatasetAxisRange;
}

interface DataEvent {
    timestamp: number;
    value: number;
}

interface AllDataEvent {
    vBat: DataEvent;
    iBat: DataEvent;
    tBat: DataEvent;
}

interface DatasetAxisRange {
    min: number;
    max: number;
}

const initialState: ChartLoggedData = {
    datasetVbat: { data: [], unit: 'V', label: 'Vbat' },
    datasetIbat: { data: [], unit: 'mA', label: 'Ibat' },
    datasetTbat: { data: [], unit: '°C', label: 'Tbat' },
};

const convert = (data: DataEvent) => ({
    x: data.timestamp,
    y: data.value,
});

const updateRange = (data: DataEvent, range?: DatasetAxisRange) => {
    if (range)
        return {
            min: Math.min(data.value, range.min),
            max: Math.min(data.value, range.max),
        };

    return {
        min: data.value,
        max: data.value,
    };
};

const shellSlice = createSlice({
    name: 'graph',
    initialState,
    reducers: {
        resetDataset: state => {
            state.datasetVbat = initialState.datasetVbat;
            state.datasetIbat = initialState.datasetIbat;
            state.datasetTbat = initialState.datasetTbat;
            state.vBatYAxisRange = undefined;
            state.tBatYAxisRange = undefined;
            state.iBatYAxisRange = undefined;
        },
        addData: (state, action: PayloadAction<AllDataEvent>) => {
            state.datasetVbat.data.push(convert(action.payload.vBat));
            state.datasetIbat.data.push(convert(action.payload.iBat));
            state.datasetTbat.data.push(convert(action.payload.tBat));

            state.vBatYAxisRange = updateRange(action.payload.vBat);
            state.iBatYAxisRange = updateRange(action.payload.iBat);
            state.tBatYAxisRange = updateRange(action.payload.tBat);
        },
        addVbatData: (state, action: PayloadAction<DataEvent>) => {
            state.datasetVbat.data.push(convert(action.payload));
            state.vBatYAxisRange = updateRange(action.payload);
        },
        addIbatData: (state, action: PayloadAction<DataEvent>) => {
            state.datasetIbat.data.push(convert(action.payload));
            state.iBatYAxisRange = updateRange(action.payload);
        },
        addTbatData: (state, action: PayloadAction<DataEvent>) => {
            state.datasetTbat.data.push(convert(action.payload));
            state.tBatYAxisRange = updateRange(action.payload);
        },
    },
});

export const getVbatDataset = (state: RootState) => state.app.graph.datasetVbat;
export const getIbatDataset = (state: RootState) => state.app.graph.datasetIbat;
export const getTbatDataset = (state: RootState) => state.app.graph.datasetTbat;

export const { resetDataset } = shellSlice.actions;
export const { addData, addVbatData, addTbatData, addIbatData } =
    shellSlice.actions;
export default shellSlice.reducer;
