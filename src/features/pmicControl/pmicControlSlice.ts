/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    Buck,
    Charger,
    Ldo,
    NpmDevice,
    PartialUpdate,
    PmicChargingState,
    PmicState,
    PmicWarningDialog,
} from './npm/types';

interface pmicControlState {
    npmDevice?: NpmDevice;
    chargers: Charger[];
    bucks: Buck[];
    ldos: Ldo[];
    soc?: number;
    pmicState: PmicState;
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    fuelGauge: boolean;
    supportedVersion?: boolean;
    warningDialog: PmicWarningDialog[];
}

const initialState: pmicControlState = {
    chargers: [],
    bucks: [],
    ldos: [],
    pmicChargingState: {
        batteryFull: false,
        trickleCharge: false,
        constantCurrentCharging: false,
        constantVoltageCharging: false,
        batteryRechargeNeeded: false,
        dieTempHigh: false,
        supplementModeActive: false,
    },
    pmicState: 'offline',
    batteryConnected: false,
    fuelGauge: false,
    warningDialog: [],
};

const pmicControlSlice = createSlice({
    name: 'pmicControl',
    initialState,
    reducers: {
        setNpmDevice(state, action: PayloadAction<NpmDevice | undefined>) {
            state.npmDevice = action.payload;
        },
        updateCharger(state, action: PayloadAction<PartialUpdate<Charger>>) {
            if (state.chargers.length < action.payload.index) return;
            const chargers = [...state.chargers];
            chargers[action.payload.index] = {
                ...state.chargers[action.payload.index],
                ...action.payload.data,
            };
            state.chargers = chargers;
        },
        setPmicState(state, action: PayloadAction<PmicState>) {
            state.pmicState = action.payload;
        },
        setChargers(state, action: PayloadAction<Charger[]>) {
            state.chargers = action.payload;
        },
        setPmicChargingState(state, action: PayloadAction<PmicChargingState>) {
            state.pmicChargingState = action.payload;
        },
        setStateOfCharge(state, action: PayloadAction<number | undefined>) {
            state.soc = action.payload;
        },
        setBucks(state, action: PayloadAction<Buck[]>) {
            state.bucks = action.payload;
        },
        updateBuck(state, action: PayloadAction<PartialUpdate<Buck>>) {
            if (state.bucks.length < action.payload.index) return;
            const buck = state.bucks[action.payload.index];
            state.bucks[action.payload.index] = {
                ...buck,
                ...action.payload.data,
            };
        },
        setLdos(state, action: PayloadAction<Ldo[]>) {
            state.ldos = action.payload;
        },
        updateLdo(state, action: PayloadAction<PartialUpdate<Ldo>>) {
            if (state.ldos.length < action.payload.index) return;

            const ldo = state.ldos[action.payload.index];
            state.ldos[action.payload.index] = {
                ...ldo,
                ...action.payload.data,
            };
        },
        setBatteryConnected(state, action: PayloadAction<boolean>) {
            state.batteryConnected = action.payload;
        },
        setFuelGauge(state, action: PayloadAction<boolean>) {
            state.fuelGauge = action.payload;
        },
        setSupportedVersion(state, action: PayloadAction<boolean | undefined>) {
            state.supportedVersion = action.payload;
        },
        requestWarningDialog(state, action: PayloadAction<PmicWarningDialog>) {
            state.warningDialog = [...state.warningDialog, action.payload];
        },
        dequeueWarningDialog(state) {
            state.warningDialog = [...state.warningDialog.slice(1)];
        },
    },
});
export const getNpmDevice = (state: RootState) =>
    state.app.pmicControl.npmDevice;
export const getPmicState = (state: RootState) =>
    state.app.pmicControl.pmicState;
export const getChargers = (state: RootState) => state.app.pmicControl.chargers;
export const getStateOfCharge = (state: RootState) =>
    state.app.pmicControl.pmicState === 'connected'
        ? state.app.pmicControl.soc
        : initialState.soc;
export const getPmicChargingState = (state: RootState) =>
    state.app.pmicControl.pmicState === 'connected'
        ? state.app.pmicControl.pmicChargingState
        : initialState.pmicChargingState;
export const getBucks = (state: RootState) => state.app.pmicControl.bucks;
export const getLdos = (state: RootState) => state.app.pmicControl.ldos;
export const isBatteryConnected = (state: RootState) =>
    state.app.pmicControl.pmicState === 'connected'
        ? state.app.pmicControl.batteryConnected
        : initialState.batteryConnected;
export const getFuelGauge = (state: RootState) =>
    state.app.pmicControl.fuelGauge;
export const isSupportedVersion = (state: RootState) =>
    state.app.pmicControl.pmicState !== 'offline'
        ? state.app.pmicControl.supportedVersion
        : initialState.supportedVersion;
export const getWarningDialog = (state: RootState) =>
    state.app.pmicControl.warningDialog.length > 0
        ? state.app.pmicControl.warningDialog[0]
        : undefined;

export const {
    setNpmDevice,
    setPmicState,
    setPmicChargingState,
    setStateOfCharge,
    updateCharger,
    setChargers,
    setBucks,
    updateBuck,
    setLdos,
    updateLdo,
    setBatteryConnected,
    setFuelGauge,
    setSupportedVersion,
    requestWarningDialog,
    dequeueWarningDialog,
} = pmicControlSlice.actions;
export default pmicControlSlice.reducer;
