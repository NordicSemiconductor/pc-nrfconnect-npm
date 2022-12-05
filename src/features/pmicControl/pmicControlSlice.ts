/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';

interface pmicControleState {
    vTerm: number;
    iCHG: number;
    enableCharging: boolean;
    vOut1: number;
    enableV1Set: boolean;
    enableBuck1: boolean;
    vOut2: number;
    enableV2Set: boolean;
    enableBuck2: boolean;
    vLdo1: number;
    enableLdo1: boolean;
    enableLoadSw1: boolean;
    vLdo2: number;
    enableLdo2: boolean;
    enableLoadSw2: boolean;
}

const initialState: pmicControleState = {
    vTerm: 3.5,
    iCHG: 32,
    enableCharging: false,
    vOut1: 1,
    enableV1Set: true,
    enableBuck1: false,
    vOut2: 1,
    enableV2Set: true,
    enableBuck2: false,
    vLdo1: 1.2,
    enableLdo1: false,
    enableLoadSw1: false,
    vLdo2: 1.2,
    enableLdo2: false,
    enableLoadSw2: false,
};

const pmicControlSlice = createSlice({
    name: 'pmicControle',
    initialState,
    reducers: {
        npmVTermChanged(state, action) {
            state.vTerm = action.payload;
        },
        npmICHGChanged(state, action) {
            state.iCHG = action.payload;
        },
        npmEnableChargingChanged(state, action) {
            state.enableCharging = action.payload;
        },
        npmVOut1Changed(state, action) {
            state.vOut1 = action.payload;
        },
        npmEnableV1SetChanged(state, action) {
            state.enableV1Set = action.payload;
        },
        npmEnableBuck1Changed(state, action) {
            state.enableBuck1 = action.payload;
        },
        npmVOut2Changed(state, action) {
            state.vOut2 = action.payload;
        },
        npmEnableV2SetChanged(state, action) {
            state.enableV2Set = action.payload;
        },
        npmEnableBuck2Changed(state, action) {
            state.enableBuck2 = action.payload;
        },
        npmVLdo1Change(state, action) {
            state.vLdo1 = action.payload;
        },
        npmEnableLdo1Change(state, action) {
            state.enableLdo1 = action.payload;
        },
        npmEnableLoadSw1Changed(state, action) {
            state.enableLoadSw1 = action.payload;
        },
        npmVLdo2Change(state, action) {
            state.vLdo2 = action.payload;
        },
        npmEnableLdo2Change(state, action) {
            state.enableLdo2 = action.payload;
        },
        npmEnableLoadSw2Changed(state, action) {
            state.enableLoadSw2 = action.payload;
        },
    },
});

const {
    npmVTermChanged,
    npmICHGChanged,
    npmEnableChargingChanged,
    npmVOut1Changed,
    npmEnableV1SetChanged,
    npmEnableBuck1Changed,
    npmVOut2Changed,
    npmEnableV2SetChanged,
    npmEnableBuck2Changed,
    npmVLdo1Change,
    npmEnableLdo1Change,
    npmEnableLoadSw1Changed,
    npmVLdo2Change,
    npmEnableLdo2Change,
    npmEnableLoadSw2Changed,
} = pmicControlSlice.actions;

export const getVTerm = (state: RootState) => state.app.pmicControl.vTerm;
export const getICHG = (state: RootState) => state.app.pmicControl.iCHG;
export const getEnableCharging = (state: RootState) =>
    state.app.pmicControl.enableCharging;
export const getVOut1 = (state: RootState) => state.app.pmicControl.vOut1;
export const getEnableV1Set = (state: RootState) =>
    state.app.pmicControl.enableV1Set;
export const getEnableBuck1 = (state: RootState) =>
    state.app.pmicControl.enableBuck1;
export const getVOut2 = (state: RootState) => state.app.pmicControl.vOut2;
export const getEnableV2Set = (state: RootState) =>
    state.app.pmicControl.enableV2Set;
export const getEnableBuck2 = (state: RootState) =>
    state.app.pmicControl.enableBuck2;
export const getVLdo1 = (state: RootState) => state.app.pmicControl.vLdo1;
export const getEnableLdo1 = (state: RootState) =>
    state.app.pmicControl.enableLdo1;
export const getEnableLoadSw1 = (state: RootState) =>
    state.app.pmicControl.enableLoadSw1;
export const getVLdo2 = (state: RootState) => state.app.pmicControl.vLdo2;
export const getEnableLdo2 = (state: RootState) =>
    state.app.pmicControl.enableLdo2;
export const getEnableLoadSw2 = (state: RootState) =>
    state.app.pmicControl.enableLoadSw2;

export {
    npmVTermChanged,
    npmICHGChanged,
    npmEnableChargingChanged,
    npmVOut1Changed,
    npmEnableV1SetChanged,
    npmEnableBuck1Changed,
    npmVOut2Changed,
    npmEnableV2SetChanged,
    npmEnableBuck2Changed,
    npmVLdo1Change,
    npmEnableLdo1Change,
    npmEnableLoadSw1Changed,
    npmVLdo2Change,
    npmEnableLdo2Change,
    npmEnableLoadSw2Changed,
};

export default pmicControlSlice.reducer;