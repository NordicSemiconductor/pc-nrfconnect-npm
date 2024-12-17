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
    Boost,
    Buck,
    Charger,
    ErrorLogs,
    FuelGauge,
    GPIO,
    Ldo,
    LED,
    LowPowerConfig,
    NpmDevice,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    POF,
    ResetConfig,
    TimerConfig,
    USBPower,
} from './npm/types';

interface pmicControlState {
    npmDevice?: NpmDevice;
    charger?: Charger;
    boosts: Boost[];
    bucks: Buck[];
    ldos: Ldo[];
    gpios: GPIO[];
    leds: LED[];
    pof?: POF;
    lowPower?: LowPowerConfig;
    reset?: ResetConfig;
    timerConfig?: TimerConfig;
    latestAdcSample?: AdcSample;
    pmicState: PmicState;
    pmicChargingState: PmicChargingState;
    batteryConnected: boolean;
    batteryAddonBoardId?: number;
    fuelGaugeSettings: FuelGauge;
    supportedVersion?: boolean;
    dialog: PmicDialog[];
    eventRecordingPath?: string;
    hardcodedBatterModels: BatteryModel[];
    storedBatterModel?: BatteryModel[];
    usbPower?: USBPower;
    errorLogs?: ErrorLogs;
}

const initialState: pmicControlState = {
    boosts: [],
    bucks: [],
    ldos: [],
    gpios: [],
    leds: [],
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
    fuelGaugeSettings: {
        enabled: false,
        chargingSamplingRate: 500,
        notChargingSamplingRate: 1000,
        reportingRate: 2000,
    },
    hardcodedBatterModels: [],
    dialog: [],
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
        setCharger(state, action: PayloadAction<Charger | undefined>) {
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
        setBatteryAddonBoardId(state, action: PayloadAction<number>) {
            state.batteryAddonBoardId = action.payload;
        },
        setBoosts(state, action: PayloadAction<Boost[]>) {
            state.boosts = action.payload;
        },
        updateBoost(state, action: PayloadAction<PartialUpdate<Boost>>) {
            if (state.boosts.length >= action.payload.index) {
                state.boosts[action.payload.index] = {
                    ...state.boosts[action.payload.index],
                    ...action.payload.data,
                };
            }
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
        setPOFs(state, action: PayloadAction<POF | undefined>) {
            state.pof = action.payload;
        },
        updatePOFs(state, action: PayloadAction<Partial<POF>>) {
            if (state.npmDevice?.pofModule) {
                state.pof = {
                    ...state.npmDevice?.pofModule?.defaults,
                    ...state.pof,
                    ...action.payload,
                };
            }
        },
        setTimerConfig(state, action: PayloadAction<TimerConfig | undefined>) {
            state.timerConfig = action.payload;
        },
        updateTimerConfig(state, action: PayloadAction<Partial<TimerConfig>>) {
            if (state.npmDevice?.timerConfigModule) {
                state.timerConfig = {
                    ...state.npmDevice.timerConfigModule.defaults,
                    ...state.timerConfig,
                    ...(action.payload as TimerConfig),
                };
            }
        },
        setLowPowerConfig(
            state,
            action: PayloadAction<LowPowerConfig | undefined>
        ) {
            state.lowPower = action.payload;
        },
        updateLowPowerConfig(
            state,
            action: PayloadAction<Partial<LowPowerConfig | undefined>>
        ) {
            if (state.npmDevice?.lowPowerModule) {
                state.lowPower = {
                    ...state.npmDevice?.lowPowerModule.defaults,
                    ...state.lowPower,
                    ...(action.payload as LowPowerConfig),
                };
            }
        },
        updateResetConfig(
            state,
            action: PayloadAction<Partial<ResetConfig | undefined>>
        ) {
            if (state.npmDevice?.resetModule) {
                state.reset = {
                    ...state.npmDevice?.resetModule.defaults,
                    ...state.reset,
                    ...(action.payload as ResetConfig),
                };
            }
        },
        setBatteryConnected(state, action: PayloadAction<boolean>) {
            state.batteryConnected = action.payload;
        },
        setFuelGauge(state, action: PayloadAction<boolean>) {
            state.fuelGaugeSettings.enabled = action.payload;
        },
        setActiveBatterModel(state, action: PayloadAction<BatteryModel>) {
            state.fuelGaugeSettings.activeBatterModel = action.payload;
        },
        setHardcodedBatterModels(state, action: PayloadAction<BatteryModel[]>) {
            state.hardcodedBatterModels = action.payload;
        },
        setStoredBatterModel(state, action: PayloadAction<BatteryModel[]>) {
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
        setUsbPower(state, action: PayloadAction<USBPower | undefined>) {
            state.usbPower = action.payload;
        },
        updateUsbPower(state, action: PayloadAction<Partial<USBPower>>) {
            if (state.npmDevice?.usbCurrentLimiterModule) {
                state.usbPower = {
                    ...state.npmDevice?.usbCurrentLimiterModule.defaults,
                    ...state.usbPower,
                    ...action.payload,
                };
            }
        },
        setFuelGaugeChargingSamplingRate(state, action: PayloadAction<number>) {
            state.fuelGaugeSettings.chargingSamplingRate = action.payload;
        },
        setFuelGaugeNotChargingSamplingRate(
            state,
            action: PayloadAction<number>
        ) {
            state.fuelGaugeSettings.notChargingSamplingRate = action.payload;
        },
        setFuelGaugeReportingRate(state, action: PayloadAction<number>) {
            state.fuelGaugeSettings.reportingRate = action.payload;
        },
        setErrorLogs(state, action: PayloadAction<Partial<ErrorLogs>>) {
            state.errorLogs = { ...state.errorLogs, ...action.payload };
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

export const getBoosts = (state: RootState) => state.app.pmicControl.boosts;
export const getBucks = (state: RootState) => state.app.pmicControl.bucks;
export const getLdos = (state: RootState) => state.app.pmicControl.ldos;
export const getGPIOs = (state: RootState) => state.app.pmicControl.gpios;
export const getLEDs = (state: RootState) => state.app.pmicControl.leds;
export const getPOF = (state: RootState) => state.app.pmicControl.pof;
export const getShip = (state: RootState) => state.app.pmicControl.lowPower;
export const getReset = (state: RootState) => state.app.pmicControl.reset;
export const getTimerConfig = (state: RootState) =>
    state.app.pmicControl.timerConfig;
export const isBatteryConnected = (state: RootState) => {
    const { pmicState, batteryConnected } = state.app.pmicControl;
    const supportsBatteryModules = getSupportsBatteryModules(state);
    const batteryModuleConnected = isBatteryModuleConnected(state);

    return parseConnectedState(
        pmicState,
        (supportsBatteryModules &&
            batteryModuleConnected &&
            batteryConnected) ||
            (batteryConnected && !supportsBatteryModules),
        initialState.batteryConnected
    );
};
export const getBatteryAddonBoardId = (state: RootState) =>
    state.app.pmicControl.batteryAddonBoardId || 0;
export const getSupportsBatteryModules = (state: RootState) =>
    state.app.pmicControl.batteryAddonBoardId !== undefined;
export const isBatteryModuleConnected = (state: RootState) =>
    state.app.pmicControl.batteryAddonBoardId !== undefined &&
    state.app.pmicControl.batteryAddonBoardId !== 0;
export const getFuelGaugeEnabled = (state: RootState) =>
    state.app.pmicControl.fuelGaugeSettings.enabled;
export const getActiveBatterModel = (state: RootState) =>
    state.app.pmicControl.fuelGaugeSettings.activeBatterModel;
export const getHardcodedBatterModels = (state: RootState) =>
    state.app.pmicControl.hardcodedBatterModels;
export const getStoredBatterModels = (state: RootState) =>
    state.app.pmicControl.storedBatterModel;
export const getUsbPower = (state: RootState) => state.app.pmicControl.usbPower;
export const canProfile = (state: RootState) =>
    state.app.pmicControl.npmDevice?.getBatteryProfiler?.() !== undefined;
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
    state.app.pmicControl.fuelGaugeSettings.chargingSamplingRate;
export const getFuelGaugeNotChargingSamplingRate = (state: RootState) =>
    state.app.pmicControl.fuelGaugeSettings.notChargingSamplingRate;
export const getFuelGaugeReportingRate = (state: RootState) =>
    state.app.pmicControl.fuelGaugeSettings.reportingRate;
export const getErrorLogs = (state: RootState) =>
    state.app.pmicControl.errorLogs;

export const {
    setNpmDevice,
    setPmicState,
    setPmicChargingState,
    setLatestAdcSample,
    updateCharger,
    setCharger,
    setBoosts,
    updateBoost,
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
    setLowPowerConfig,
    updateLowPowerConfig,
    updateResetConfig,
    setBatteryConnected,
    setBatteryAddonBoardId,
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
    setErrorLogs,
} = pmicControlSlice.actions;
export default pmicControlSlice.reducer;
