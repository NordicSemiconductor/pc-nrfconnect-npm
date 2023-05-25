/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../../appReducer';
import {
    ProfilingCSVProgress,
    ProjectPathPair,
} from '../../components/Profiling/types';

interface profilingProjectState {
    recentProjects: string[];
    profilingProjects: ProjectPathPair[];
    profilingCSVProgress: ProfilingCSVProgress[];
}

const initialState: profilingProjectState = {
    recentProjects: [],
    profilingProjects: [],
    profilingCSVProgress: [],
};

const profilingProjectsSlice = createSlice({
    name: 'profilingProjects',
    initialState,
    reducers: {
        setRecentProjects(state, action: PayloadAction<string[]>) {
            state.recentProjects = action.payload;
        },
        setProfilingProjects(state, action: PayloadAction<ProjectPathPair[]>) {
            state.profilingProjects = action.payload;
        },
        updateProfilingProject(state, action: PayloadAction<ProjectPathPair>) {
            const index = state.profilingProjects.findIndex(
                profile => profile.path === action.payload.path
            );
            if (index !== -1) {
                state.profilingProjects[index] = action.payload;
            }
        },
        setProjectProfileProgress(
            state,
            action: PayloadAction<ProfilingCSVProgress>
        ) {
            const index = state.profilingCSVProgress.findIndex(
                progress =>
                    progress.path === action.payload.path &&
                    progress.index === action.payload.index
            );

            if (index !== -1) {
                state.profilingCSVProgress[index] = action.payload;
            } else {
                state.profilingCSVProgress.push(action.payload);
            }
        },
    },
});

export const getRecentProjects = (state: RootState) =>
    state.app.profilingProjects.recentProjects;
export const getProfileProjects = (state: RootState) =>
    state.app.profilingProjects.profilingProjects;
export const getProjectProfileProgress = (state: RootState) =>
    state.app.profilingProjects.profilingCSVProgress;

export const {
    setRecentProjects,
    setProfilingProjects,
    updateProfilingProject,
    setProjectProfileProgress,
} = profilingProjectsSlice.actions;
export default profilingProjectsSlice.reducer;
