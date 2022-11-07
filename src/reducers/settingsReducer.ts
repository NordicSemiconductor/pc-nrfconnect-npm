/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import { RootState, SettingsState } from './types';

const initialState: SettingsState = {
    vTerm: 3.5,
    iCHG: 32,
    enableCharging: false,
    vOut1: 1,
    enableV1Set: false,
    enableBuck1: false,
    vOut2: 1,
    enableV2Set: false,
    enableBuck2: false,
    enableLoadSw1: false,
    enableLoadSw2: false,
};

const settingsSlice = createSlice({
    name: 'settings',
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
        npmEnableLoadSw1Changed(state, action) {
            state.enableLoadSw1 = action.payload;
        },
        npmEnableLoadSw2Changed(state, action) {
            state.enableLoadSw2 = action.payload;
        },
    },
});

export default settingsSlice.reducer;

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
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
} = settingsSlice.actions;

const getVTerm = (state: RootState) => state.app.settings.vTerm;
const getICHG = (state: RootState) => state.app.settings.iCHG;
const getEnableCharging = (state: RootState) =>
    state.app.settings.enableCharging;
const getVOut1 = (state: RootState) => state.app.settings.vOut1;
const getEnableV1Set = (state: RootState) => state.app.settings.enableV1Set;
const getEnableBuck1 = (state: RootState) => state.app.settings.enableBuck1;
const getVOut2 = (state: RootState) => state.app.settings.vOut2;
const getEnableV2Set = (state: RootState) => state.app.settings.enableV2Set;
const getEnableBuck2 = (state: RootState) => state.app.settings.enableBuck2;
const getEnableLoadSw1 = (state: RootState) => state.app.settings.enableLoadSw1;
const getEnableLoadSw2 = (state: RootState) => state.app.settings.enableLoadSw2;

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
    npmEnableLoadSw1Changed,
    npmEnableLoadSw2Changed,
    getVTerm,
    getICHG,
    getEnableCharging,
    getVOut1,
    getEnableV1Set,
    getEnableBuck1,
    getVOut2,
    getEnableV2Set,
    getEnableBuck2,
    getEnableLoadSw1,
    getEnableLoadSw2,
};
