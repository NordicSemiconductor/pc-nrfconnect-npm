/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

interface shellState {
    isPaused: boolean;
}

const initialState: shellState = {
    isPaused: false,
};

const modemSlice = createSlice({
    name: 'shell',
    initialState,
    reducers: {
        setIsPaused: (state, action: PayloadAction<boolean>) => {
            state.isPaused = action.payload;
        },
    },
});

export const isPaused = (state: RootState) => state.app.shell.isPaused;

export const { setIsPaused } = modemSlice.actions;
export default modemSlice.reducer;
