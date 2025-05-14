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
import { getNpmDevice } from '../../features/pmicControl/pmicControlSlice';
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
): ProjectPathPair => {
    if (!fs.existsSync(filePath)) {
        return { path: filePath, settings: undefined, error: 'fileMissing' };
    }

    try {
        const profilingProject = JSON.parse(
            fs.readFileSync(filePath).toString()
        ) as ProfilingProject;

        const project = updateSettingsWithValidPath(
            zodProfilingProject.parse(profilingProject)
        );

        return {
            path: filePath,
            settings: project,
        };
    } catch (error) {
        return { path: filePath, settings: undefined, error: 'fileCorrupted' };
    }
};

export const readAndUpdateProjectSettings =
    (
        filePath: string,
        updateProject?: (currentProject: ProfilingProject) => ProfilingProject
    ): AppThunk =>
    (dispatch, getState) => {
        const project = readProjectSettingsFromFile(filePath);

        if (project.error) {
            return project;
        }

        // It is assumed here that the file exists and is valid

        if (project?.settings && updateProject) {
            try {
                const newSettings = updateProject(project.settings);
                newSettings.appVersion = packageJsons.version;
                fs.writeFileSync(
                    filePath,
                    JSON.stringify(newSettings, null, 2)
                );
                project.settings = newSettings;
            } catch (error) {
                logger.error(describeError(error));
            }
        }
        dispatch(
            updateProfilingProject({
                path: filePath,
                settings: project.settings,
                error:
                    getNpmDevice(getState())?.deviceType ===
                    project.settings?.deviceType
                        ? undefined
                        : 'unsupportedDevice',
            })
        );
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
