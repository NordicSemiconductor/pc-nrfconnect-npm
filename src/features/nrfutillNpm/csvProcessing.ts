/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { getAppDir, getAppFile } from 'pc-nrfconnect-shared';

import { RootState } from '../../appReducer';
import {
    generateDefaultProjectPath,
    readAndUpdateProjectSettings,
} from '../../components/Profiling/helpers';
import {
    ProfilingProject,
    ProfilingProjectProfile,
} from '../../components/Profiling/types';
import { TDispatch } from '../../thunk';
import { generateTempFolder, stringToFile } from '../helpers';
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

const NRFUTIL_HOME = path.join(
    getAppDir(),
    'resources',
    'nrfutil-npm',
    os.platform()
);

let nrfUtilVersion = 'unknown';

const NRFUTIL_BINARY = getAppFile(
    path.join('resources', 'nrfutil-npm', os.platform(), 'bin', 'nrfutil-npm')
);

export const startProcessingCsv =
    (profile: Profile, index: number) =>
    (dispatch: TDispatch, getState: () => RootState) => {
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
    (projectAbsolutePath: string, index: number) => (dispatch: TDispatch) => {
        const pathObject = path.parse(NRFUTIL_BINARY);
        if (!fs.existsSync(pathObject.dir)) {
            dispatch(
                addProjectProfileProgress({
                    path: projectAbsolutePath,
                    index,
                    message:
                        'This operation is not supported by your operating system. The profile must be processed on Windows or Linux.',
                    progress: 100,
                    errorLevel: 'warning',
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
            return;
        }

        dispatch(
            readAndUpdateProjectSettings(projectAbsolutePath, project => {
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

                let knowFailure = false;

                const processProgress = (data: string) => {
                    console.log(data);
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
                            updateProjectProfileProgress({
                                path: projectAbsolutePath,
                                index,
                                message: `Processing cycle ${nominator} / ${denominator}`,
                                progress: (nominator / denominator) * 100,
                            })
                        );
                    } else if (
                        data.includes(
                            'Battery voltage does not cross the defined low cut off voltage. Please define higher cut off level and run again.'
                        )
                    ) {
                        knowFailure = true;
                        dispatch(
                            updateProjectProfileProgress({
                                path: projectAbsolutePath,
                                index,
                                message: `The smallest voltage in the collected profile data is bigger than the defined discharged cutoff voltage. Please define a correct discharged cutoff voltage and run again.`,
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

                const env = { ...process.env };
                env.NRFUTIL_HOME = NRFUTIL_HOME;

                const processCSV = spawn(
                    NRFUTIL_BINARY,
                    [
                        'generate',
                        '--input-file',
                        inputFile,
                        '--output-directory',
                        resultsFolder,
                        '--v-cutoff-high',
                        project.vUpperCutOff.toString(),
                        '--v-cutoff-low',
                        project.vLowerCutOff.toString(),
                    ],
                    {
                        env,
                    }
                );

                profile.paramsJson = undefined;
                profile.batteryJson = undefined;

                dispatch(
                    addProjectProfileProgress({
                        path: projectAbsolutePath,
                        index,
                        message: 'Processing has started',
                        progress: 0,
                        cancel: () => {
                            // TODO Ask for fix in NRF UTIL
                            processCSV.kill('SIGINT');
                            dispatch(
                                removeProjectProfileProgress({
                                    path: projectAbsolutePath,
                                    index,
                                })
                            );
                        },
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
                        readAndUpdateProjectSettings(
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

                                    proj.profiles[index].nrfUtilVersion =
                                        nrfUtilVersion;

                                    dispatch(
                                        removeProjectProfileProgress({
                                            path: projectAbsolutePath,
                                            index,
                                        })
                                    );
                                } else if (!knowFailure) {
                                    dispatch(
                                        updateProjectProfileProgress({
                                            path: projectAbsolutePath,
                                            index,
                                            message:
                                                'Something went wrong while processing the data. Please try again.',
                                            errorLevel: 'error',
                                            cancel: () => {
                                                dispatch(
                                                    removeProjectProfileProgress(
                                                        {
                                                            path: projectAbsolutePath,
                                                            index,
                                                        }
                                                    )
                                                );
                                            },
                                        })
                                    );
                                }

                                return proj;
                            }
                        )
                    );

                    if (fs.existsSync(tempFolder)) {
                        fs.rmSync(tempFolder, {
                            recursive: true,
                            force: true,
                        });
                    }
                });

                return project;
            })
        );
    };

export const getVersion = () =>
    new Promise<string>((resolve, reject) => {
        const pathObject = path.parse(NRFUTIL_BINARY);
        if (!fs.existsSync(pathObject.dir)) {
            reject(new Error('OS not supported'));
            return;
        }

        const tempFolder = generateTempFolder();
        const resultsFolder = path.join(tempFolder, 'Results');
        fs.mkdirSync(resultsFolder);

        const args = ['--version'];

        const env = { ...process.env };
        env.NRFUTIL_HOME = NRFUTIL_HOME;

        const processCSV = spawn(NRFUTIL_BINARY, args, {
            env,
        });

        let result = '';
        let error = false;

        processCSV.stdout.on('data', data => {
            result += data.toString();
            error = error || false;
        });

        processCSV.stderr.on('data', data => {
            result += data.toString();
        });

        processCSV.on('close', () => {
            if (!error) {
                resolve(result);
            } else {
                reject(result);
            }
        });
    });

export const mergeBatteryParams = (
    project: ProfilingProject,
    profiles: ProfilingProjectProfile[]
) =>
    new Promise<string>((resolve, reject) => {
        const pathObject = path.parse(NRFUTIL_BINARY);
        if (!fs.existsSync(pathObject.dir)) {
            reject(new Error('OS not supported'));
            return;
        }

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
            'merge',
            '--output-directory',
            resultsFolder,
            '--v-cutoff-high',
            project.vUpperCutOff.toString(),
            '--v-cutoff-low',
            project.vLowerCutOff.toString(),
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

        const env = { ...process.env };
        env.NRFUTIL_HOME = NRFUTIL_HOME;

        const processCSV = spawn(NRFUTIL_BINARY, args, {
            env,
        });

        processCSV.stdout.on('data', data => {
            console.log(`stdout: ${data}`);
        });

        processCSV.stderr.on('data', data => {
            console.error(`stderr: ${data}`);
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

getVersion()
    .then(version => {
        nrfUtilVersion = version;
    })
    .catch(() => {
        nrfUtilVersion = 'unknown';
    });
