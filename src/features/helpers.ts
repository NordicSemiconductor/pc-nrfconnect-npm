/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import { v4 as uuidV4 } from 'uuid';

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
