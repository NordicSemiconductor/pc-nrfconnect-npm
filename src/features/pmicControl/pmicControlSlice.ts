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
    CCProfilingState,
    Charger,
    Ldo,
    NpmDevice,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
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
    dialog: PmicDialog[];
    eventRecordingPath?: string;
    activeBatterModel?: BatteryModel;
    hardcodedBatterModels: BatteryModel[];
    storedBatterModel?: (BatteryModel | null)[];
    usbPowered: boolean;
    profilingState: CCProfilingState;
    fuelGaugeChargingSamplingRate: number;
    fuelGaugeNotChargingSamplingRate: number;
    fuelGaugeReportingRate: number;
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
    hardcodedBatterModels: [],
    dialog: [],
    usbPowered: false,
    profilingState: 'Off',
    fuelGaugeChargingSamplingRate: 500,
    fuelGaugeNotChargingSamplingRate: 1000,
    fuelGaugeReportingRate: 2000,
};

const pmicControlSlice = createSlice({
    name: 'pmicControl',
    initialState,
    reducers: {
        setNpmDevice(state, action: PayloadAction<NpmDevice>) {
            if (state.npmDevice) {
                state.npmDevice.release();
            }

            return {
                ...initialState,
                eventRecordingPath: state.eventRecordingPath,
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
        setHardcodedBatterModels(state, action: PayloadAction<BatteryModel[]>) {
            state.hardcodedBatterModels = action.payload;
        },
        setStoredBatterModel(
            state,
            action: PayloadAction<(BatteryModel | null)[]>
        ) {
            state.storedBatterModel = action.payload;
        },
        setSupportedVersion(state, action: PayloadAction<boolean | undefined>) {
            state.supportedVersion = action.payload;
        },
        requestDialog(state, action: PayloadAction<PmicDialog>) {
            const dialogIndex = state.dialog.findIndex(
                dialog => dialog.uuid === action.payload.uuid
            );

            if (dialogIndex !== -1) {
                state.dialog[dialogIndex] = action.payload;
            } else {
                state.dialog = [...state.dialog, action.payload];
            }
        },
        dequeueDialog(state) {
            state.dialog = [...state.dialog.slice(1)];
        },
        setEventRecordingPath(state, action: PayloadAction<string>) {
            state.eventRecordingPath = action.payload;
        },
        stopEventRecording(state) {
            state.eventRecordingPath = undefined;
        },
        setUsbPowered(state, action: PayloadAction<boolean>) {
            state.usbPowered = action.payload;
        },
        setFuelGaugeChargingSamplingRate(state, action: PayloadAction<number>) {
            state.fuelGaugeChargingSamplingRate = action.payload;
        },
        setFuelGaugeNotChargingSamplingRate(
            state,
            action: PayloadAction<number>
        ) {
            state.fuelGaugeNotChargingSamplingRate = action.payload;
        },
        setFuelGaugeReportingRate(state, action: PayloadAction<number>) {
            state.fuelGaugeReportingRate = action.payload;
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
export const getHardcodedBatterModels = (state: RootState) =>
    state.app.pmicControl.hardcodedBatterModels;
export const getStoredBatterModels = (state: RootState) =>
    state.app.pmicControl.storedBatterModel;
export const isUsbPowered = (state: RootState) =>
    state.app.pmicControl.usbPowered;
export const canProfile = (state: RootState) =>
    state.app.pmicControl.npmDevice?.getBatteryProfiler() !== undefined;
export const isSupportedVersion = (state: RootState) =>
    state.app.pmicControl.pmicState !== 'ek-disconnected'
        ? state.app.pmicControl.supportedVersion
        : initialState.supportedVersion;
export const getDialog = (state: RootState) =>
    state.app.pmicControl.dialog.length > 0
        ? state.app.pmicControl.dialog[0]
        : undefined;

export const getEventRecording = (state: RootState) =>
    state.app.pmicControl.eventRecordingPath !== undefined &&
    state.app.pmicControl.eventRecordingPath.length > 0;
export const getEventRecordingPath = (state: RootState) =>
    state.app.pmicControl.eventRecordingPath;
export const getFuelGaugeChargingSamplingRate = (state: RootState) =>
    state.app.pmicControl.fuelGaugeChargingSamplingRate;
export const getFuelGaugeNotChargingSamplingRate = (state: RootState) =>
    state.app.pmicControl.fuelGaugeNotChargingSamplingRate;
export const getFuelGaugeReportingRate = (state: RootState) =>
    state.app.pmicControl.fuelGaugeReportingRate;

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
    setHardcodedBatterModels,
    setStoredBatterModel,
    setSupportedVersion,
    requestDialog,
    dequeueDialog,
    setEventRecordingPath,
    stopEventRecording,
    setUsbPowered,
    setFuelGaugeChargingSamplingRate,
    setFuelGaugeNotChargingSamplingRate,
    setFuelGaugeReportingRate,
} = pmicControlSlice.actions;
export default pmicControlSlice.reducer;
