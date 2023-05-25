/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import {
    atomicUpdateProjectSettings,
    generateDefaultProjectPath,
} from '../../components/Profiling/helpers';
import {
    ProfilingProject,
    ProfilingProjectProfile,
} from '../../components/Profiling/types';
import { TDispatch } from '../../thunk';
import { generateTempFolder, stringToFile } from '../helpers';
import { Profile } from '../pmicControl/npm/types';
import { setProjectProfileProgress } from '../pmicControl/profilingProjectsSlice.';

const generateProfileName = (
    project: ProfilingProject,
    profile: ProfilingProjectProfile
) =>
    `${project.name}_${project.capacity}mAh_T${
        profile.temperature < 0 ? 'n' : 'p'
    }${profile.temperature}`;

export const startProcessingCsv =
    (profile: Profile, index: number) => (dispatch: TDispatch) => {
        const profilingProjectPath = generateDefaultProjectPath(profile);

        dispatch(generateParamsFromCSV(profilingProjectPath, index));
    };

export const generateParamsFromCSV =
    (projectAbsolutePath: string, index: number) => (dispatch: TDispatch) => {
        dispatch(
            atomicUpdateProjectSettings(projectAbsolutePath, project => {
                const profile = project.profiles[index];

                if (!profile.csvPath) {
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
                    project,
                    project.profiles[index]
                )}.csv`;

                const inputFile = path.join(tempFolder, newCSVFileName);
                fs.copyFileSync(csvPathAbsolute, inputFile);

                const resultsFolder = path.join(tempFolder, 'Results');

                fs.mkdirSync(resultsFolder);

                const processProgress = (data: string) => {
                    const progressMatch = data.match(
                        /Processing cycle [0-9]+ \/ [0-9]+/
                    );
                    if (progressMatch) {
                        const fraction = progressMatch[0].replace(
                            'Processing cycle',
                            ''
                        );
                        const denominator = Number.parseInt(
                            fraction.split('/')[1],
                            10
                        );
                        const nominator = Number.parseInt(
                            fraction.split('/')[0],
                            10
                        );
                        dispatch(
                            setProjectProfileProgress({
                                path: projectAbsolutePath,
                                index,
                                message: `Processing cycle ${nominator} / ${denominator}`,
                                progress: (nominator / denominator) * 100,
                            })
                        );
                    }
                };

                const processCSV = spawn(
                    'nrfutil.exe',
                    [
                        'npm',
                        'generate',
                        '--input-file',
                        inputFile,
                        '--output-directory',
                        resultsFolder,
                        '--v-cutoff-high',
                        profile.vUpperCutOff.toString(),
                        '--v-cutoff-low',
                        profile.vLowerCutOff.toString(),
                    ],
                    {
                        cwd: 'C:\\Workspace',
                    }
                );

                profile.paramsJson = undefined;
                profile.batteryJson = undefined;

                dispatch(
                    setProjectProfileProgress({
                        path: projectAbsolutePath,
                        index,
                        message: 'Processing has started',
                        progress: 0,
                    })
                );

                processCSV.stdout.on('data', data => {
                    processProgress(data.toString());
                });

                processCSV.stderr.on('data', data => {
                    processProgress(data.toString());
                });

                processCSV.on('close', () => {
                    dispatch(
                        atomicUpdateProjectSettings(
                            projectAbsolutePath,
                            proj => {
                                const batteryModelPath = path.join(
                                    resultsFolder,
                                    'battery_model.json'
                                );
                                const paramsPath = path.join(
                                    resultsFolder,
                                    `${generateProfileName(
                                        proj,
                                        project.profiles[index]
                                    )}_params.json`
                                );

                                if (
                                    fs.existsSync(batteryModelPath) &&
                                    fs.existsSync(paramsPath)
                                ) {
                                    proj.profiles[index].batteryJson =
                                        fs.readFileSync(
                                            batteryModelPath,
                                            'utf8'
                                        );

                                    proj.profiles[index].paramsJson =
                                        fs.readFileSync(paramsPath, 'utf8');

                                    dispatch(
                                        setProjectProfileProgress({
                                            path: projectAbsolutePath,
                                            index,
                                            message: 'Processing Complete',
                                            progress: 100,
                                            ready: true,
                                        })
                                    );
                                } else {
                                    dispatch(
                                        setProjectProfileProgress({
                                            path: projectAbsolutePath,
                                            index,
                                            message:
                                                'ERROR: Something went wrong while processing the data. Please try again.',
                                            progress: 100,
                                            error: true,
                                            ready: true,
                                        })
                                    );
                                }

                                return proj;
                            }
                        )
                    ).finally(() => {
                        if (fs.existsSync(tempFolder)) {
                            fs.rmSync(tempFolder, {
                                recursive: true,
                                force: true,
                            });
                        }
                    });
                });

                return project;
            })
        );
    };

export const mergeBatteryParams = (
    project: ProfilingProject,
    profiles: ProfilingProjectProfile[]
) =>
    new Promise<string>((resolve, reject) => {
        if (profiles.length === 0) {
            return;
        }

        if (profiles.length === 1 && profiles[0].batteryJson) {
            resolve(profiles[0].batteryJson);
            return;
        }

        const tempFolder = generateTempFolder();
        const resultsFolder = path.join(tempFolder, 'Results');
        fs.mkdirSync(resultsFolder);

        const args = [
            'npm',
            'merge',
            '--output-directory',
            resultsFolder,
            '--v-cutoff-high',
            '0',
            '--v-cutoff-low',
            '0',
        ];

        profiles.forEach(profile => {
            if (profile.paramsJson) {
                const paramsPath = path.join(
                    tempFolder,
                    `${generateProfileName(project, profile)}_params.json`
                );
                stringToFile(
                    path.join(
                        tempFolder,
                        `${generateProfileName(project, profile)}_params.json`
                    ),
                    profile.paramsJson
                );

                args.push('--input-file', paramsPath);
            }
        });

        const processCSV = spawn('nrfutil.exe', args, {
            cwd: 'C:\\Workspace',
        });

        processCSV.on('close', () => {
            const batteryModelPath = path.join(
                resultsFolder,
                'battery_model.json'
            );

            if (fs.existsSync(batteryModelPath)) {
                resolve(fs.readFileSync(batteryModelPath, 'utf8'));
            } else {
                reject();
            }

            if (fs.existsSync(tempFolder)) {
                fs.rmSync(tempFolder, {
                    recursive: true,
                    force: true,
                });
            }
        });
    });
