/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import { CCProfile, CCProfilingState } from './npm/types';

type ProfileStage =
    | 'Configuration'
    | 'Checklist'
    | 'Charging'
    | 'Resting'
    | 'Profiling';

interface Profile {
    name: string;
    vLowerCutOff: number;
    vUpperCutOff: number;
    capacity: number;
    temperatures: number[];
    baseDirector: string;
    restingProfiles: CCProfile[];
    profilingProfiles: CCProfile[];
}

interface ProfileComplete {
    message: string;
    level: 'warning' | 'success' | 'danger';
}

interface profilingState {
    index: number;
    startTime: number;
    stage?: ProfileStage;
    profile: Profile;
    capacityConsumed: number;
    completeStep?: ProfileComplete;
    ccProfilingState: CCProfilingState;
}

const initialState: profilingState = {
    index: 0,
    startTime: 0,
    profile: {
        name: 'battery',
        vUpperCutOff: 4.2,
        vLowerCutOff: 3.1,
        capacity: 400,
        temperatures: [25],
        baseDirector: '~/',
        restingProfiles: [],
        profilingProfiles: [],
    },
    capacityConsumed: 0,
    ccProfilingState: 'Off',
};

const profilingSlice = createSlice({
    name: 'profiling',
    initialState,
    reducers: {
        closeProfiling() {
            return { ...initialState };
        },
        setProfilingStage(state, action: PayloadAction<ProfileStage>) {
            state.stage = action.payload;
        },
        setCompleteStep(state, action: PayloadAction<ProfileComplete>) {
            state.completeStep = action.payload;
        },
        setProfile(state, action: PayloadAction<Profile>) {
            state.profile = action.payload;
        },
        nextProfile(state) {
            state.completeStep = undefined;
            state.index += 1;
            state.startTime = Date.now();
            state.stage = 'Checklist';
            state.capacityConsumed = 0;
            state.ccProfilingState = 'Off';
        },
        restartProfile(state) {
            state.completeStep = undefined;
            state.startTime = Date.now();
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
    },
});

export const getProfilingStage = (state: RootState) =>
    state.app.profiling.completeStep ? 'Complete' : state.app.profiling.stage;
export const getProfile = (state: RootState) => state.app.profiling.profile;
export const getProfileIndex = (state: RootState) => state.app.profiling.index;
export const getProfileStartTime = (state: RootState) =>
    state.app.profiling.startTime;
export const getCompleteStep = (state: RootState) =>
    state.app.profiling.completeStep;
export const getCapacityConsumed = (state: RootState) =>
    state.app.profiling.capacityConsumed;
export const getCcProfilingState = (state: RootState) =>
    state.app.profiling.ccProfilingState;

export const {
    closeProfiling,
    setProfilingStage,
    setCompleteStep,
    setProfile,
    nextProfile,
    restartProfile,
    incrementCapacityConsumed,
    setCcProfiling,
} = profilingSlice.actions;
export default profilingSlice.reducer;
