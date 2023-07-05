/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export type ProjectPathPair = {
    path: string;
    settings: ProfilingProject | undefined;
    error?: 'fileMissing' | 'fileCorrupted';
};

export type ProfilingCSVProgress = {
    path: string;
    index: number;
    message: string;
    progress?: number;
    errorLevel?: 'warning' | 'error';
    cancel: () => void;
};

export interface ProfilingProjectProfile {
    temperature: number;
    csvPath?: string;
    csvReady: boolean;
    paramsJson?: string;
    batteryJson?: string;
    batteryInc?: string;
    exclude?: boolean;
    nrfUtilVersion?: string;
}
export interface ProfilingProject {
    name: string;
    capacity: number;
    vLowerCutOff: number;
    vUpperCutOff: number;
    profiles: ProfilingProjectProfile[];
    appVersion: string;
}
