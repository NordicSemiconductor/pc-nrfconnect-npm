/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
export enum GPIOMode1300 {
    'Input' = 0,
    'Input logic 1',
    'Input logic 0',
    'Input rising edge event',
    'Input falling edge event',
    'Output interrupt',
    'Output reset',
    'Output power loss warning',
    'Output logic 1',
    'Output logic 0',
}

export const GPIOModeValues = Object.keys(GPIOMode1300)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const GPIOModeKeys = Object.values(GPIOMode1300).filter(key =>
    Number.isNaN(Number(key)),
);

export enum GPIOPull1300 {
    'Pull down' = 0,
    'Pull up',
    'Pull disable',
}
export const GPIOPullValues = Object.keys(GPIOPull1300)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const GPIOPullKeys = Object.values(GPIOPull1300).filter(key =>
    Number.isNaN(Number(key)),
);

export enum GPIODrive1300 {
    '1 mA' = 1,
    '6 mA' = 6,
}
export const GPIODriveValues = Object.keys(GPIODrive1300)
    .filter(key => !Number.isNaN(Number(key)))
    .map(Number);
export const GPIODriveKeys = Object.values(GPIODrive1300).filter(key =>
    Number.isNaN(Number(key)),
);
