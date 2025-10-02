/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

interface DownloadProfileSlice {
    showDialog: boolean;
    modelName?: string;
    bufferToWite?: Buffer;
}

const initialState: DownloadProfileSlice = {
    showDialog: false,
};

const downloadBatteryProfileSlice = createSlice({
    name: 'downloadBatteryProfile',
    initialState,
    reducers: {
        closeDialog() {
            return {
                ...initialState,
            };
        },
        showDialog(
            state,
            action: PayloadAction<{ buffer: Buffer; name?: string }>,
        ) {
            state.showDialog = true;
            state.bufferToWite = action.payload.buffer;
            state.modelName = action.payload.name;
        },
    },
});

export const getShowDialog = (state: RootState) =>
    state.app.downloadBatteryModel.bufferToWite;
export const getBuffer = (state: RootState) =>
    state.app.downloadBatteryModel.bufferToWite;
export const getModelName = (state: RootState) =>
    state.app.downloadBatteryModel.modelName;

export const { closeDialog, showDialog } = downloadBatteryProfileSlice.actions;
export default downloadBatteryProfileSlice.reducer;
