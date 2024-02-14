/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AppThunk,
    describeError,
    logger,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import fs from 'fs';
import path from 'path';

import packageJsons from '../../../package.json';
import { RootState } from '../../appReducer';
import { Profile } from '../../features/pmicControl/npm/types';
import {
    addRecentProject,
    loadRecentProject,
    setRecentProjects,
    updateProfilingProject,
} from '../../features/pmicControl/profilingProjectsSlice.';
import {
    ProfilingProject,
    ProfilingProjectProfile,
    ProjectPathPair,
    zodProfilingProject,
} from './types';

export const REST_DURATION = 900; // seconds
export const REPORTING_RATE = 1000;
export const PROFILE_FOLDER_PREFIX = 'profile_';

export const generateDefaultProjectPath = (profile: Profile) =>
    path.join(profile.baseDirectory, profile.name, 'profileSettings.json');

export const isProfileReadyForProcessing = (
    projectSettingsPath: string,
    profile: ProfilingProjectProfile
) =>
    !(
        !profile.csvPath ||
        !profile.csvReady ||
        !fs.existsSync(path.resolve(projectSettingsPath, profile.csvPath))
    );

const guaranteeValidPath = (somePath?: string) =>
    somePath
        ? somePath.replace(
              new RegExp(
                  [`\\${path.win32.sep}`, path.posix.sep].join('|'),
                  'g'
              ),
              path.sep
          )
        : undefined;

const updateSettingsWithValidPath = (project?: ProfilingProject) =>
    project
        ? {
              ...project,
              profiles: project.profiles.map(profile => ({
                  ...profile,
                  csvPath: guaranteeValidPath(profile.csvPath),
              })),
          }
        : undefined;

export const readProjectSettingsFromFile = (
    filePath: string
): Omit<ProjectPathPair, 'path'> => {
    if (!fs.existsSync(filePath)) {
        return { settings: undefined, error: 'fileMissing' };
    }

    try {
        const profilingProject = JSON.parse(
            fs.readFileSync(filePath).toString()
        ) as ProfilingProject;

        zodProfilingProject.parse(profilingProject);

        return { settings: updateSettingsWithValidPath(profilingProject) };
    } catch (error) {
        return { settings: undefined, error: 'fileCorrupted' };
    }
};

export const readAndUpdateProjectSettings =
    (
        filePath: string,
        updateProject: (currentProject: ProfilingProject) => ProfilingProject
    ): AppThunk =>
    dispatch => {
        const profilingProject = JSON.parse(
            fs.readFileSync(filePath).toString()
        ) as ProfilingProject;

        zodProfilingProject.parse(profilingProject);

        const oldProject = updateSettingsWithValidPath(profilingProject);

        if (oldProject) {
            try {
                const newProject = updateProject(oldProject);
                newProject.appVersion = packageJsons.version;
                fs.writeFileSync(filePath, JSON.stringify(newProject, null, 2));
                dispatch(
                    updateProfilingProject({
                        path: filePath,
                        settings: newProject,
                    })
                );
            } catch (error) {
                logger.error(describeError(error));
            }
        }
    };

export const saveProjectSettings =
    (
        filePath: string,
        projectToSave: Omit<ProfilingProject, 'appVersion'>
    ): AppThunk<RootState> =>
    (dispatch, getState) => {
        const project: ProfilingProject = {
            ...projectToSave,
            appVersion: packageJsons.version,
        };

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(project, null, 2));

        // Abort any ongoing processes with the same project file name
        getState()
            .app.profilingProjects.profilingCSVProgress.filter(
                progress => progress.path === filePath
            )
            .forEach(progress => progress.cancel());

        dispatch(addRecentProject(filePath));
    };

export const reloadRecentProjects = (): AppThunk => dispatch =>
    dispatch(setRecentProjects(loadRecentProject()));
