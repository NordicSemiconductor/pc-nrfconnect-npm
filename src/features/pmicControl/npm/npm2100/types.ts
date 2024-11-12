/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export const nPM2100LdoModeControlValues = [
    'auto',
    'hp',
    'ulp',
    'gpio',
] as const;
export type nPM2100LdoModeControl =
    (typeof nPM2100LdoModeControlValues)[number];

export const nPM2100GPIOControlPinSelectValues = [
    'GPIO0HI',
    'GPIO0LO',
    'GPIO1HI',
    'GPIO1LO',
] as const;
export type nPM2100GPIOControlPinSelect =
    (typeof nPM2100GPIOControlPinSelectValues)[number];

export const nPM2100GPIOControlModeValues = [
    'HP/OFF',
    'ULP/OFF',
    'HP/ULP',
] as const;
export type nPM2100GPIOControlMode =
    (typeof nPM2100GPIOControlModeValues)[number];

export const nPM2100LDOSoftStartValues = [
    '25mA',
    '38mA',
    '50mA',
    '75mA',
    '150mA',
] as const; // Default 75
export type nPM2100LDOSoftStart = (typeof nPM2100LDOSoftStartValues)[number];

export const nPM2100LoadSwitchSoftStartValues = [
    '40mA',
    '70mA',
    '75mA',
    '80mA',
    '110mA',
] as const; // Default 75
export type nPM2100LoadSwitchSoftStart =
    (typeof nPM2100LoadSwitchSoftStartValues)[number];

export enum npm2100TimerMode {
    'General Purpose' = 'GENERAL_PURPOSE',
    'Watchdog reset' = 'WATCHDOG_RESET',
    'Watchdog power cycle' = 'WATCHDOG_POWER_CYCLE',
    'Wake up' = 'WAKE-UP',
}
