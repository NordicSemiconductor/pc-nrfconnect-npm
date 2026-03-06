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

export enum SoftStartCurrentLDOMode {
    '25 mA' = 25,
    '38 mA' = 38,
    '50 mA' = 50,
    '75 mA' = 75,
    '150 mA' = 150,
} // Default 75
export const softStartCurrentLDOModeKV = Object.entries(
    SoftStartCurrentLDOMode,
).filter(entry => !Number.isNaN(Number(entry[1])));
export const softStartCurrentLDOModeKeys = softStartCurrentLDOModeKV.map(
    kv => kv[0],
);
export const softStartCurrentLDOModeValues = softStartCurrentLDOModeKV.map(kv =>
    Number(kv[1]),
);

export enum SoftStartCurrentLoadSwitchMode {
    '40 mA' = 40,
    '70 mA' = 70,
    '75 mA' = 75,
    '80 mA' = 80,
    '110 mA' = 110,
} // Default 75
export const softStartCurrentLoadSwitchModeKV = Object.entries(
    SoftStartCurrentLoadSwitchMode,
).filter(entry => !Number.isNaN(Number(entry[1])));
export const softStartCurrentLoadSwitchModeKeys =
    softStartCurrentLoadSwitchModeKV.map(kv => kv[0]);
export const softStartCurrentLoadSwitchModeValues =
    softStartCurrentLoadSwitchModeKV.map(kv => Number(kv[1]));

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
