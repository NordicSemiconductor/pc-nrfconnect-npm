/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getModule,
    Progress,
} from '@nordicsemiconductor/pc-nrfconnect-shared/nrfutil';

export default async (
    inputFiles: string[],
    resultsFolder: string,
    vUpperCutOff: number,
    vLowerCutOff: number,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController,
) => {
    const box = await getModule('npm');
    const args: string[] = [
        '--output-directory',
        resultsFolder,
        '--v-cutoff-high',
        vUpperCutOff.toString(),
        '--v-cutoff-low',
        vLowerCutOff.toString(),
    ];

    inputFiles.forEach(file => {
        args.push('--input-file');
        args.push(file);
    });

    await box.spawnNrfutilSubcommand(
        'merge',
        args,
        onProgress,
        undefined,
        undefined,
        controller,
    );
};
