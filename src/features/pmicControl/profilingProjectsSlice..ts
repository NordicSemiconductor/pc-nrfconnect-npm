/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getPersistentStore } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import path from 'path';

import type { RootState } from '../../appReducer';
import {
    ProfilingCSVProgress,
    ProjectPathPair,
} from '../../components/Profiling/types';

export const loadRecentProject = (): string[] =>
    (getPersistentStore().get(`profiling_projects`) ?? []) as string[];

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

const pathsAreEqual = (path1: string, path2: string) => {
    path1 = path.resolve(path1);
    path2 = path.resolve(path2);
    if (process.platform === 'win32')
        return path1.toLowerCase() === path2.toLowerCase();
    return path1 === path2;
};

const profilingProjectsSlice = createSlice({
    name: 'profilingProjects',
    initialState,
    reducers: {
        setRecentProjects(state, action: PayloadAction<string[]>) {
            state.recentProjects = action.payload;
        },
        addRecentProject(state, action: PayloadAction<string>) {
            const projects = loadRecentProject();

            if (
                projects.findIndex(p => pathsAreEqual(p, action.payload)) === -1
            ) {
                projects.push(action.payload);
                getPersistentStore().set(`profiling_projects`, projects);
                state.recentProjects = projects;
                state.profilingCSVProgress = state.profilingCSVProgress.filter(
                    progress => progress.path !== action.payload,
                );
            }
        },
        removeRecentProject(state, action: PayloadAction<string>) {
            const projects = loadRecentProject().filter(
                dir => !pathsAreEqual(dir, action.payload),
            );
            getPersistentStore().set(`profiling_projects`, projects);

            state.recentProjects = projects;
            state.profilingCSVProgress = state.profilingCSVProgress.filter(
                progress => progress.path !== action.payload,
            );
        },
        setProfilingProjects(state, action: PayloadAction<ProjectPathPair[]>) {
            state.profilingProjects = action.payload;
        },
        updateProfilingProject(state, action: PayloadAction<ProjectPathPair>) {
            const index = state.profilingProjects.findIndex(
                profile => profile.path === action.payload.path,
            );
            if (index !== -1) {
                state.profilingProjects[index] = action.payload;
            }
        },
        addProjectProfileProgress(
            state,
            action: PayloadAction<ProfilingCSVProgress>,
        ) {
            const index = state.profilingCSVProgress.findIndex(
                progress =>
                    progress.path === action.payload.path &&
                    progress.index === action.payload.index,
            );

            if (index !== -1) {
                state.profilingCSVProgress[index] = action.payload;
            } else {
                state.profilingCSVProgress.push(action.payload);
            }
        },
        updateProjectProfileProgress(
            state,
            action: PayloadAction<
                Partial<ProfilingCSVProgress> &
                    Pick<ProfilingCSVProgress, 'path' | 'index'>
            >,
        ) {
            const index = state.profilingCSVProgress.findIndex(
                progress =>
                    progress.path === action.payload.path &&
                    progress.index === action.payload.index,
            );

            if (index !== -1) {
                state.profilingCSVProgress[index] = {
                    ...state.profilingCSVProgress[index],
                    ...action.payload,
                };
            }
        },
        removeProjectProfileProgress(
            state,
            action: PayloadAction<Pick<ProfilingCSVProgress, 'path' | 'index'>>,
        ) {
            const index = state.profilingCSVProgress.findIndex(
                progress =>
                    progress.path === action.payload.path &&
                    progress.index === action.payload.index,
            );

            if (index !== -1) {
                state.profilingCSVProgress.splice(index, 1);
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
    addRecentProject,
    removeRecentProject,
    setProfilingProjects,
    updateProfilingProject,
    addProjectProfileProgress,
    updateProjectProfileProgress,
    removeProjectProfileProgress,
} = profilingProjectsSlice.actions;
export default profilingProjectsSlice.reducer;
