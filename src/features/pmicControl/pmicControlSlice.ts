/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    AdcSample,
    BatteryModel,
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
    latestAdcSample?: AdcSample;
    pmicState: PmicState;
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    fuelGauge: boolean;
    supportedVersion?: boolean;
    warningDialog: PmicWarningDialog[];
    eventRecording: boolean;
    eventRecordingPath?: string;
    activeBatterModel?: BatteryModel;
    defaultBatterModels: BatteryModel[];
    storedBatterModel?: BatteryModel;
    usbPowered: boolean;
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
    pmicState: 'ek-disconnected',
    batteryConnected: false,
    fuelGauge: false,
    defaultBatterModels: [],
    warningDialog: [],
    eventRecording: false,
    usbPowered: false,
};

const pmicControlSlice = createSlice({
    name: 'pmicControl',
    initialState,
    reducers: {
        setNpmDevice(_, action: PayloadAction<NpmDevice | undefined>) {
            return {
                ...initialState,
                npmDevice: action.payload,
            };
        },
        updateCharger(state, action: PayloadAction<PartialUpdate<Charger>>) {
            if (state.chargers.length >= action.payload.index) {
                state.chargers[action.payload.index] = {
                    ...state.chargers[action.payload.index],
                    ...action.payload.data,
                };
            }
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
        setLatestAdcSample(
            state,
            action: PayloadAction<AdcSample | undefined>
        ) {
            state.latestAdcSample = action.payload;
        },
        setBucks(state, action: PayloadAction<Buck[]>) {
            state.bucks = action.payload;
        },
        updateBuck(state, action: PayloadAction<PartialUpdate<Buck>>) {
            if (state.bucks.length >= action.payload.index) {
                state.bucks[action.payload.index] = {
                    ...state.bucks[action.payload.index],
                    ...action.payload.data,
                };
            }
        },
        setLdos(state, action: PayloadAction<Ldo[]>) {
            state.ldos = action.payload;
        },
        updateLdo(state, action: PayloadAction<PartialUpdate<Ldo>>) {
            if (state.ldos.length >= action.payload.index) {
                state.ldos[action.payload.index] = {
                    ...state.ldos[action.payload.index],
                    ...action.payload.data,
                };
            }
        },
        setBatteryConnected(state, action: PayloadAction<boolean>) {
            state.batteryConnected = action.payload;
        },
        setFuelGauge(state, action: PayloadAction<boolean>) {
            state.fuelGauge = action.payload;
        },
        setActiveBatterModel(state, action: PayloadAction<BatteryModel>) {
            state.activeBatterModel = action.payload;
        },
        setDefaultBatterModels(state, action: PayloadAction<BatteryModel[]>) {
            state.defaultBatterModels = action.payload;
        },
        setStoredBatterModel(
            state,
            action: PayloadAction<BatteryModel | undefined>
        ) {
            state.storedBatterModel = action.payload;
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
        setEventRecordingPath(
            state,
            action: PayloadAction<string | undefined>
        ) {
            state.eventRecordingPath = action.payload;
        },
        setUsbPowered(state, action: PayloadAction<boolean>) {
            state.usbPowered = action.payload;
        },
    },
});

const parseConnectedState = <T>(
    state: PmicState,
    connectedValue: T,
    fallback: T
) => (state === 'pmic-connected' ? connectedValue : fallback);

export const getNpmDevice = (state: RootState) =>
    state.app.pmicControl.npmDevice;
export const getPmicState = (state: RootState) =>
    state.app.pmicControl.pmicState;
export const getChargers = (state: RootState) => state.app.pmicControl.chargers;
export const getLatestAdcSample = (state: RootState) => {
    const { pmicState, latestAdcSample } = state.app.pmicControl;
    return parseConnectedState(
        pmicState,
        latestAdcSample,
        initialState.latestAdcSample
    );
};
export const getPmicChargingState = (state: RootState) => {
    const { pmicState, pmicChargingState } = state.app.pmicControl;
    return parseConnectedState(
        pmicState,
        pmicChargingState,
        initialState.pmicChargingState
    );
};
export const getBucks = (state: RootState) => state.app.pmicControl.bucks;
export const getLdos = (state: RootState) => state.app.pmicControl.ldos;
export const isBatteryConnected = (state: RootState) => {
    const { pmicState, batteryConnected } = state.app.pmicControl;
    return parseConnectedState(
        pmicState,
        batteryConnected,
        initialState.batteryConnected
    );
};
export const getFuelGauge = (state: RootState) =>
    state.app.pmicControl.fuelGauge;
export const getActiveBatterModel = (state: RootState) =>
    state.app.pmicControl.activeBatterModel;
export const getDefaultBatterModels = (state: RootState) =>
    state.app.pmicControl.defaultBatterModels;
export const getStoredBatterModel = (state: RootState) =>
    state.app.pmicControl.storedBatterModel;
export const isUsbPowered = (state: RootState) =>
    state.app.pmicControl.usbPowered;
export const isSupportedVersion = (state: RootState) =>
    state.app.pmicControl.pmicState !== 'ek-disconnected'
        ? state.app.pmicControl.supportedVersion
        : initialState.supportedVersion;
export const getWarningDialog = (state: RootState) =>
    state.app.pmicControl.warningDialog.length > 0
        ? state.app.pmicControl.warningDialog[0]
        : undefined;

export const getEventRecording = (state: RootState) =>
    state.app.pmicControl.eventRecordingPath !== undefined &&
    state.app.pmicControl.eventRecordingPath.length > 0;
export const getEventRecordingPath = (state: RootState) =>
    state.app.pmicControl.eventRecordingPath;

export const {
    setNpmDevice,
    setPmicState,
    setPmicChargingState,
    setLatestAdcSample,
    updateCharger,
    setChargers,
    setBucks,
    updateBuck,
    setLdos,
    updateLdo,
    setBatteryConnected,
    setFuelGauge,
    setActiveBatterModel,
    setDefaultBatterModels,
    setStoredBatterModel,
    setSupportedVersion,
    requestWarningDialog,
    dequeueWarningDialog,
    setEventRecordingPath,
    setUsbPowered,
} = pmicControlSlice.actions;
export default pmicControlSlice.reducer;
