/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export enum GPIOMode2100 {
    'Input' = 'INPUT',
    'Output' = 'OUTPUT',
    'Interrupt output, active high' = 'INTHI',
    'Interrupt output, active low' = 'INTLO',
}

export const GPIOModeKeys = Object.keys(GPIOMode2100);
export const GPIOModeValues = Object.values(GPIOMode2100);

export enum GPIOPull2100 {
    'Pull down' = 'PULLDOWN',
    'Pull up' = 'PULLUP',
    'Pull disable' = 'NOPULL',
}

export const GPIOPullKeys = Object.keys(GPIOPull2100);
export const GPIOPullValues = Object.values(GPIOPull2100);

export enum GPIODrive2100 {
    'Normal' = 'NORMAL',
    'High' = 'HIGH',
}
export const GPIODriveKeys = Object.keys(GPIODrive2100);
export const GPIODriveValues = Object.values(GPIODrive2100);
