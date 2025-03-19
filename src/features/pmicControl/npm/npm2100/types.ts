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

export enum nPM2100LDOSoftStart {
    '25 mA' = '25mA',
    '38 mA' = '38mA',
    '50 mA' = '50mA',
    '75 mA' = '75mA',
    '150 mA' = '150mA',
} // Default 75

export const nPM2100LDOSoftStartValues = Object.values(nPM2100LDOSoftStart);
export const nPM2100LDOSoftStartKeys = Object.keys(nPM2100LDOSoftStart);
export enum nPM2100SoftStart {
    '40 mA' = '40mA',
    '70 mA' = '70mA',
    '75 mA' = '75mA',
    '80 mA' = '80mA',
    '110 mA' = '110mA',
} // Default 75

export const nPM2100SoftStartValues = Object.values(nPM2100SoftStart);
export const nPM2100SoftStartKeys = Object.keys(nPM2100SoftStart);

export enum npm2100TimerMode {
    'General Purpose' = 'GENERAL_PURPOSE',
    'Watchdog reset' = 'WATCHDOG_RESET',
    'Watchdog power cycle' = 'WATCHDOG_POWER_CYCLE',
    'Wake up' = 'WAKE-UP',
}

export const npm2100LongPressResetDebounceValues = [
    '5s',
    '10s',
    '20s',
    '30s',
] as const;
export type npm2100LongPressResetDebounce =
    (typeof npm2100LongPressResetDebounceValues)[number];

export enum npm2100ResetPinSelection {
    'PG/RESET' = 'PGRESET',
    'SHPHLD' = 'SHPHLD',
}
