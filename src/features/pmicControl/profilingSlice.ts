/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { CCProfilingState, Profile } from './npm/types';

type ProfileStage =
    | 'ActiveLoadNotVSYS'
    | 'MissingSyncBoard'
    | 'Configuration'
    | 'Checklist'
    | 'Charging'
    | 'Resting'
    | 'Profiling';

interface ProfileComplete {
    message: string;
    level: 'success' | 'danger' | 'warning' | 'terminal';
}

interface profilingState {
    index: number;
    stage?: ProfileStage;
    profile: Profile;
    capacityConsumed: number;
    completeStep?: ProfileComplete;
    ccProfilingState: CCProfilingState;
    latestTBat?: number;
    latestVLoad?: number;
    abort?: () => void;
}

const initialState: profilingState = {
    index: 0,
    profile: {
        name: 'battery',
        vUpperCutOff: 4.2,
        vLowerCutOff: 3.1,
        capacity: 400,
        ratedChargingCurrent: 200,
        ntcThermistor: '10 kΩ',
        temperatures: [25],
        baseDirectory: '~/',
        restingProfiles: [],
        profilingProfiles: [],
        iTerm: 10,
    },
    capacityConsumed: 0,
    ccProfilingState: 'Off',
};

const profilingSlice = createSlice({
    name: 'profiling',
    initialState,
    reducers: {
        closeProfiling() {
            return {
                ...initialState,
            };
        },
        setProfilingStage(state, action: PayloadAction<ProfileStage>) {
            state.stage = action.payload;
        },
        setCompleteStep(state, action: PayloadAction<ProfileComplete>) {
            if (state.stage) {
                state.completeStep = action.payload;
            }
        },
        setProfile(state, action: PayloadAction<Profile>) {
            state.profile = action.payload;
        },
        nextProfile(state) {
            state.completeStep = undefined;
            state.index += 1;
            state.stage = 'Checklist';
            state.capacityConsumed = 0;
            state.ccProfilingState = 'Off';
        },
        restartProfile(state) {
            state.completeStep = undefined;
            state.stage = 'Checklist';
            state.capacityConsumed = 0;
            state.ccProfilingState = 'Off';
        },
        incrementCapacityConsumed(state, action: PayloadAction<number>) {
            state.capacityConsumed += action.payload;
        },
        setCcProfiling(state, action: PayloadAction<CCProfilingState>) {
            state.ccProfilingState = action.payload;
        },
        setLatestTBat(state, action: PayloadAction<number | undefined>) {
            state.latestTBat = action.payload;
        },
        setLatestVLoad(state, action: PayloadAction<number | undefined>) {
            state.latestVLoad = action.payload;
        },
        setAbortAction(state, action: PayloadAction<() => void>) {
            state.abort = action.payload;
        },
        clearAbortAction(state) {
            state.abort = undefined;
        },
    },
});

export const getProfilingStage = (state: RootState) =>
    state.app.profiling.completeStep ? 'Complete' : state.app.profiling.stage;
export const getProfile = (state: RootState) => state.app.profiling.profile;
export const getProfileIndex = (state: RootState) => state.app.profiling.index;
export const getCompleteStep = (state: RootState) =>
    state.app.profiling.completeStep;
export const getCapacityConsumed = (state: RootState) =>
    state.app.profiling.capacityConsumed;
export const getCcProfilingState = (state: RootState) =>
    state.app.profiling.ccProfilingState;
export const getLatestTBat = (state: RootState) =>
    state.app.profiling.latestTBat;
export const getLatestVLoad = (state: RootState) =>
    state.app.profiling.latestVLoad;
export const getAbort = (state: RootState) => state.app.profiling.abort;

export const {
    closeProfiling,
    setProfilingStage,
    setCompleteStep,
    setLatestTBat,
    setLatestVLoad,
    setProfile,
    nextProfile,
    restartProfile,
    incrementCapacityConsumed,
    setCcProfiling,
    setAbortAction,
    clearAbortAction,
} = profilingSlice.actions;
export default profilingSlice.reducer;
