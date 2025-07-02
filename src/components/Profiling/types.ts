/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';

import { zodSchemaNpmMode } from '../../features/pmicControl/npm/types';

export type ProjectPathPair = {
    path: string;
    settings: ProfilingProject | undefined;
    error?: 'fileMissing' | 'fileCorrupted' | 'unsupportedDevice';
};

export type ProfilingCSVProgress = {
    path: string;
    index: number;
    message: string;
    progress?: number;
    errorLevel?: 'warning' | 'error';
    cancel: () => void;
};

export const zodProfilingProjectProfile = z.object({
    temperature: z.number(),
    csvPath: z.string().optional(),
    csvReady: z.boolean(),
    paramsJson: z.string().optional(),
    batteryJson: z.string().optional(),
    batteryInc: z.string().optional(),
    exclude: z.boolean().optional(),
    nrfUtilVersion: z.string().optional(),
});

export type ProfilingProjectProfile = z.infer<
    typeof zodProfilingProjectProfile
>;

export const zodProfilingProject = z.object({
    name: z.string(),
    deviceType: zodSchemaNpmMode.default('npm1300'),
    capacity: z.number(),
    vLowerCutOff: z.number(),
    vUpperCutOff: z.number(),
    profiles: zodProfilingProjectProfile.array(),
    appVersion: z.string(),
    iTerm: z.string().optional(),
});

export type ProfilingProject = z.infer<typeof zodProfilingProject>;
