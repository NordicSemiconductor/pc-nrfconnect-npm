/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';
import fs from 'fs';
import path from 'path';
import { getPersistentStore } from 'pc-nrfconnect-shared';

import { ProfilingProject } from '../../features/pmicControl/npm/types';
import {
    setProfilingProjects,
    updateProfilingProject,
} from '../../features/pmicControl/profilingSlice';
import { TDispatch } from '../../thunk';

export const REST_DURATION = 900; // seconds
export const REPORTING_RATE = 1000;
export const PROFILE_FOLDER_PREFIX = 'profile_';

export const generateDefaultProjectPath = (dir: string) =>
    `${dir}/profileSettings.json`;

const loadRecentProject = (): string[] =>
    (getPersistentStore().get(`profiling_projects`) ?? []) as string[];

const updateRecentProjects =
    (projectPaths: string[]) => (dispatch: TDispatch) => {
        const projects = Array.from(new Set(projectPaths));
        getPersistentStore().set(`profiling_projects`, projects);
        dispatch(reloadRecentProjects());
    };

export const removeRecentProject =
    (projectPath: string) => (dispatch: TDispatch) => {
        const projects = loadRecentProject().filter(dir => dir !== projectPath);
        getPersistentStore().set(`profiling_projects`, projects);
        dispatch(reloadRecentProjects());
    };

export const addRecentProject =
    (projectPath: string) => (dispatch: TDispatch) => {
        const projects = loadRecentProject();
        projects.push(projectPath);
        getPersistentStore().set(`profiling_projects`, projects);
        dispatch(reloadRecentProjects());
    };
export const readProjectSettingsFromFile = (filePath: string) => {
    const pathObject = path.parse(filePath);
    if (pathObject.ext === '.json') {
        const store = new Store<ProfilingProject>({
            cwd: pathObject.dir,
            name: pathObject.name,
        });

        return store.store;
    }

    return undefined;
};

export const updateProjectSettings =
    (filePath: string, project: ProfilingProject) => (dispatch: TDispatch) => {
        const pathObject = path.parse(filePath);
        const store = new Store<ProfilingProject>({
            cwd: pathObject.dir,
            name: pathObject.name,
        });

        store.set(project);

        dispatch(updateProfilingProject({ path: filePath, settings: project }));
    };

export const saveProjectSettings =
    (filePath: string, project: ProfilingProject) => (dispatch: TDispatch) => {
        const pathObject = path.parse(filePath);
        const store = new Store<ProfilingProject>({
            cwd: pathObject.dir,
            name: pathObject.name,
        });

        store.set(project);

        dispatch(updateRecentProjects([...loadRecentProject(), filePath]));
        dispatch(reloadRecentProjects());
    };

export const reloadRecentProjects = () => (dispatch: TDispatch) =>
    dispatch(
        setProfilingProjects(
            loadRecentProject().map(filePath => {
                if (fs.existsSync(filePath)) {
                    return {
                        path: filePath,
                        settings: readProjectSettingsFromFile(filePath),
                    };
                }

                return {
                    path: filePath,
                    settings: undefined,
                };
            })
        )
    );
