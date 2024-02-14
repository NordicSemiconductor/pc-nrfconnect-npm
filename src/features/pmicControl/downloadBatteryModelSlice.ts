/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

interface DownloadProfileSlice {
    showDialog: boolean;
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
        showDialog(state, action: PayloadAction<Buffer>) {
            state.showDialog = true;
            state.bufferToWite = action.payload;
        },
    },
});

export const getShowDialog = (state: RootState) =>
    state.app.downloadBatteryModel.bufferToWite;
export const getBuffer = (state: RootState) =>
    state.app.downloadBatteryModel.bufferToWite;

export const { closeDialog, showDialog } = downloadBatteryProfileSlice.actions;
export default downloadBatteryProfileSlice.reducer;
