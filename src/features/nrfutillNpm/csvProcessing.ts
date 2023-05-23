/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidV4 } from 'uuid';

import { ProfilingProject } from '../pmicControl/npm/types';

const generateTempFolder = (): string => {
    const tempFolder = `${os.tmpdir()}/${uuidV4()}`;
    if (fs.existsSync(tempFolder)) {
        return generateTempFolder();
    }

    fs.mkdirSync(tempFolder);
    return tempFolder;
};

export const generateParamsFromCSV = (
    projectAbsolutePath: string,
    profiles: ProfilingProject,
    index: number
) =>
    new Promise<number | null>((resolve, reject) => {
        const profile = profiles.profiles[index];

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

        const newCSVFileName = `${profiles.name}_${profiles.capacity}mAh_T${
            profile.temperature < 0 ? 'n' : 'p'
        }${profile.temperature}.csv`;
        fs.copyFileSync(csvPathAbsolute, `${tempFolder}/${newCSVFileName}`);

        const processCSV = spawn('TODO', ['args TODO']);

        // TODO save pid to project settings

        processCSV.stdout.on('data', data => {
            // TODO process and update progress
            console.log(`stdout: ${data}`);
        });

        processCSV.stderr.on('data', data => {
            // TODO Clean up temp file
            reject(data);
        });

        processCSV.on('close', code => {
            // TODO Read params and save to project
            // TODO Clean up temp file
            resolve(code);
        });
    });
