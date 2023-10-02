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
    GPIO,
    Ldo,
    LED,
    NpmDevice,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    POF,
    ShipModeConfig,
    TimerConfig,
    USBPower,
} from './npm/types';

interface pmicControlState {
    npmDevice?: NpmDevice;
    charger?: Charger;
    bucks: Buck[];
    ldos: Ldo[];
    gpios: GPIO[];
    leds: LED[];
    pof: POF;
    ship: ShipModeConfig;
    timerConfig: TimerConfig;
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
    usbPower: USBPower;
    fuelGaugeChargingSamplingRate: number;
    fuelGaugeNotChargingSamplingRate: number;
    fuelGaugeReportingRate: number;
}

const initialState: pmicControlState = {
    bucks: [],
    ldos: [],
    gpios: [],
    leds: [],
    pof: {
        enable: true,
        threshold: 2.8,
        polarity: 'Active high',
    },
    timerConfig: {
        mode: 'Boot monitor',
        prescaler: 'Slow',
        period: 0,
    },
    ship: {
        timeToActive: 96,
        invPolarity: true,
        longPressReset: false,
        twoButtonReset: false,
    },
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
    usbPower: {
        detectStatus: 'No USB connection',
        currentLimiter: 0.1,
    },
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
        updateCharger(state, action: PayloadAction<Partial<Charger>>) {
            if (state.charger) {
                state.charger = {
                    ...state.charger,
                    ...action.payload,
                };
            }
        },
        setPmicState(state, action: PayloadAction<PmicState>) {
            state.pmicState = action.payload;
        },
        setCharger(state, action: PayloadAction<Charger>) {
            state.charger = action.payload;
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
        setGPIOs(state, action: PayloadAction<GPIO[]>) {
            state.gpios = action.payload;
        },
        updateGPIOs(state, action: PayloadAction<PartialUpdate<GPIO>>) {
            if (state.gpios.length >= action.payload.index) {
                state.gpios[action.payload.index] = {
                    ...state.gpios[action.payload.index],
                    ...action.payload.data,
                };
            }
        },
        setLEDs(state, action: PayloadAction<LED[]>) {
            state.leds = action.payload;
        },
        updateLEDs(state, action: PayloadAction<PartialUpdate<LED>>) {
            if (state.leds.length >= action.payload.index) {
                state.leds[action.payload.index] = {
                    ...state.leds[action.payload.index],
                    ...action.payload.data,
                };
            }
        },
        setPOFs(state, action: PayloadAction<POF>) {
            state.pof = action.payload;
        },
        updatePOFs(state, action: PayloadAction<Partial<POF>>) {
            state.pof = {
                ...state.pof,
                ...action.payload,
            };
        },
        setTimerConfig(state, action: PayloadAction<TimerConfig>) {
            state.timerConfig = action.payload;
        },
        updateTimerConfig(state, action: PayloadAction<Partial<TimerConfig>>) {
            state.timerConfig = {
                ...state.timerConfig,
                ...action.payload,
            };
        },
        setShipModeConfig(state, action: PayloadAction<ShipModeConfig>) {
            state.ship = action.payload;
        },
        updateShipModeConfig(
            state,
            action: PayloadAction<Partial<ShipModeConfig>>
        ) {
            state.ship = {
                ...state.ship,
                ...action.payload,
            };
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
        setUsbPower(state, action: PayloadAction<USBPower>) {
            state.usbPower = action.payload;
        },
        updateUsbPower(state, action: PayloadAction<Partial<USBPower>>) {
            state.usbPower = {
                ...state.usbPower,
                ...action.payload,
            };
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
export const getCharger = (state: RootState) => state.app.pmicControl.charger;
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
export const getGPIOs = (state: RootState) => state.app.pmicControl.gpios;
export const getLEDs = (state: RootState) => state.app.pmicControl.leds;
export const getPOF = (state: RootState) => state.app.pmicControl.pof;
export const getShip = (state: RootState) => state.app.pmicControl.ship;
export const getTimerConfig = (state: RootState) =>
    state.app.pmicControl.timerConfig;
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
export const getUsbPower = (state: RootState) => state.app.pmicControl.usbPower;
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
    setCharger,
    setBucks,
    updateBuck,
    setLdos,
    updateLdo,
    setGPIOs,
    updateGPIOs,
    setLEDs,
    updateLEDs,
    setPOFs,
    updatePOFs,
    setTimerConfig,
    updateTimerConfig,
    setShipModeConfig,
    updateShipModeConfig,
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
    setUsbPower,
    updateUsbPower,
    setFuelGaugeChargingSamplingRate,
    setFuelGaugeNotChargingSamplingRate,
    setFuelGaugeReportingRate,
} = pmicControlSlice.actions;
export default pmicControlSlice.reducer;
