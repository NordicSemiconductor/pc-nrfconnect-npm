/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getAppDir } from '@nordicsemiconductor/pc-nrfconnect-shared';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuidV4 } from 'uuid';

import { NpmModel } from './pmicControl/npm/types';

export const generateTempFolder = (): string => {
    const tempFolder = `${os.tmpdir()}/${uuidV4()}`;
    if (fs.existsSync(tempFolder)) {
        return generateTempFolder();
    }

    fs.mkdirSync(tempFolder);
    return tempFolder;
};

export const stringToFile = (filePath: string, content: string) => {
    fs.writeFileSync(filePath, content);
};

export const getBundledBatteries = (npmModel: NpmModel) => {
    const modelsPath = path.join(
        getAppDir(),
        'resources',
        'batteryModels',
        npmModel
    );

    const brands = fs.readdirSync(modelsPath);

    return brands.map(brandFolder => {
        const fullPath = path.join(modelsPath, brandFolder);

        return {
            brandName: brandFolder,
            folder: fullPath,
            fileNames: fs.readdirSync(fullPath),
        };
    });
};
