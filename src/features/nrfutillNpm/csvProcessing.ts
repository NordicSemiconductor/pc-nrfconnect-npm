/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AppThunk, logger } from '@nordicsemiconductor/pc-nrfconnect-shared';
import { getModule } from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';
import describeError from '@nordicsemiconductor/pc-nrfconnect-shared/src/logging/describeError';
import fs from 'fs';
import path from 'path';

import { RootState } from '../../appReducer';
import {
    generateDefaultProjectPath,
    readAndUpdateProjectSettings,
    readProjectSettingsFromFile,
} from '../../components/Profiling/helpers';
import {
    ProfilingProject,
    ProfilingProjectProfile,
} from '../../components/Profiling/types';
import { generateTempFolder, stringToFile } from '../helpers';
import generate from '../nrfutil/npm/generate';
import merge from '../nrfutil/npm/merge';
import { Profile } from '../pmicControl/npm/types';
import {
    addProjectProfileProgress,
    removeProjectProfileProgress,
    updateProjectProfileProgress,
} from '../pmicControl/profilingProjectsSlice.';

const generateProfileName = (
    project: ProfilingProject,
    profile: ProfilingProjectProfile
) =>
    `${project.name}_${project.capacity}mAh_T${
        profile.temperature < 0 ? 'n' : 'p'
    }${profile.temperature}`;

let nrfUtilVersion: string | undefined;

export const startProcessingCsv =
    (profile: Profile, index: number): AppThunk<RootState> =>
    (dispatch, getState) => {
        const profilingProjectPath = generateDefaultProjectPath(profile);

        const progress =
            getState().app.profilingProjects.profilingCSVProgress.find(
                p => p.path === profilingProjectPath && p.index === index
            );

        if (progress && !progress.errorLevel) {
            // Already Processing
            return;
        }

        if (progress?.cancel) {
            progress.cancel();
        }

        dispatch(generateParamsFromCSV(profilingProjectPath, index));
    };
export const generateParamsFromCSV =
    (
        projectAbsolutePath: string,
        index: number
    ): AppThunk<RootState, Promise<void>> =>
    async dispatch => {
        const project = readProjectSettingsFromFile(projectAbsolutePath);

        if (!project || !project.settings) {
            throw new Error('Invalid project index');
        }
        const profile = project.settings?.profiles[index];

        if (!profile || !profile.csvPath) {
            throw new Error('no csv path');
        }

        const csvPathAbsolute = path.resolve(
            projectAbsolutePath,
            profile.csvPath
        );

        if (!fs.existsSync(csvPathAbsolute)) {
            throw new Error('csv file does not exists');
        }

        const tempFolder = generateTempFolder();

        const newCSVFileName = `${generateProfileName(
            project.settings,
            profile
        )}.csv`;

        const inputFile = path.join(tempFolder, newCSVFileName);
        fs.copyFileSync(csvPathAbsolute, inputFile);

        const resultsFolder = path.join(tempFolder, 'Results');

        fs.mkdirSync(resultsFolder);

        const cancelController = new AbortController();

        dispatch(
            addProjectProfileProgress({
                path: projectAbsolutePath,
                index,
                message: 'Processing has started',
                progress: 0,
                cancel: () => {
                    cancelController.abort();
                    dispatch(
                        removeProjectProfileProgress({
                            path: projectAbsolutePath,
                            index,
                        })
                    );
                },
            })
        );

        try {
            await generate(
                inputFile,
                resultsFolder,
                project.settings.vUpperCutOff,
                project.settings.vLowerCutOff,
                progress => {
                    dispatch(
                        updateProjectProfileProgress({
                            path: projectAbsolutePath,
                            index,
                            message: progress.description,
                            progress: progress.stepProgressPercentage,
                        })
                    );
                },
                cancelController
            );

            profile.paramsJson = undefined;
            profile.batteryJson = undefined;
            profile.batteryInc = undefined;

            const batteryModelJsonPath = path.join(
                resultsFolder,
                'battery_model.json'
            );
            const batteryModelIncPath = path.join(
                resultsFolder,
                'battery_model.inc'
            );

            const paramsPath = path.join(
                resultsFolder,
                `${generateProfileName(project.settings, profile)}_params.json`
            );

            if (
                fs.existsSync(batteryModelJsonPath) &&
                fs.existsSync(paramsPath)
            ) {
                if (nrfUtilVersion) {
                    const module = await getModule('npm');
                    nrfUtilVersion = (await module.getModuleVersion()).version;
                }
                dispatch(
                    readAndUpdateProjectSettings(projectAbsolutePath, proj => {
                        proj.profiles[index].batteryJson = fs.readFileSync(
                            batteryModelJsonPath,
                            'utf8'
                        );
                        proj.profiles[index].batteryInc = fs.readFileSync(
                            batteryModelIncPath,
                            'utf8'
                        );

                        proj.profiles[index].batteryJson = fs.readFileSync(
                            batteryModelJsonPath,
                            'utf8'
                        );

                        proj.profiles[index].paramsJson = fs.readFileSync(
                            paramsPath,
                            'utf8'
                        );

                        proj.profiles[index].nrfUtilVersion = nrfUtilVersion;

                        dispatch(
                            removeProjectProfileProgress({
                                path: projectAbsolutePath,
                                index,
                            })
                        );

                        return proj;
                    })
                );
            }

            if (fs.existsSync(tempFolder)) {
                fs.rmSync(tempFolder, {
                    recursive: true,
                    force: true,
                });
            }
        } catch (error) {
            logger.error(describeError(error));
            dispatch(
                updateProjectProfileProgress({
                    path: projectAbsolutePath,
                    index,
                    message:
                        'Something went wrong while processing the data. Please try again.',
                    errorLevel: 'error',
                    cancel: () => {
                        dispatch(
                            removeProjectProfileProgress({
                                path: projectAbsolutePath,
                                index,
                            })
                        );
                    },
                })
            );
        }
    };

export const mergeBatteryParams = async (
    project: ProfilingProject,
    profiles: ProfilingProjectProfile[]
) => {
    if (profiles.length === 0) {
        throw new Error('Nothing to process');
    }

    if (
        profiles.length === 1 &&
        profiles[0].batteryJson &&
        profiles[0].batteryInc
    ) {
        return {
            json: profiles[0].batteryJson,
            inc: profiles[0].batteryInc,
        };
    }

    const tempFolder = generateTempFolder();
    const resultsFolder = path.join(tempFolder, 'Results');
    fs.mkdirSync(resultsFolder);

    const inputFiles = profiles
        .filter(profile => profile.paramsJson)
        .map(profile => {
            const paramsPath = path.join(
                tempFolder,
                `${generateProfileName(project, profile)}_params.json`
            );
            stringToFile(
                path.join(
                    tempFolder,
                    `${generateProfileName(project, profile)}_params.json`
                ),
                profile.paramsJson as string
            );

            return paramsPath;
        });

    await merge(
        inputFiles,
        resultsFolder,
        project.vUpperCutOff,
        project.vLowerCutOff,
        console.log
    );

    const batteryModelJsonPath = path.join(resultsFolder, 'battery_model.json');

    const batteryModelIncPath = path.join(resultsFolder, 'battery_model.inc');

    if (
        fs.existsSync(batteryModelJsonPath) &&
        fs.existsSync(batteryModelIncPath)
    ) {
        const result = {
            json: fs.readFileSync(batteryModelJsonPath, 'utf8'),
            inc: fs.readFileSync(batteryModelIncPath, 'utf8'),
        };

        if (fs.existsSync(tempFolder)) {
            fs.rmSync(tempFolder, {
                recursive: true,
                force: true,
            });
        }

        return result;
    }

    throw new Error('Something went wrong');
};
