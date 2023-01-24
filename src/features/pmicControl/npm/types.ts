/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { RangeType } from '../../../utils/helpers';

export type PartialUpdate<T> = { index: number; data: Partial<T> };

export type LdoMode = 'ldoSwitch' | 'LDO';
export type BuckMode = 'vSet' | 'software';

export type IrqType = string;
export type IrqEvent = string;

export type IrqTypeEventPair = {
    type: IrqType;
    event: IrqEvent;
};

export type Charger = {
    vTerm: number;
    iChg: number;
    enabled: boolean;
};

export type Buck = {
    vOut: number;
    mode: BuckMode;
    enabled: boolean;
};

export type Ldo = {
    voltage: number;
    enabled: boolean;
    mode: LdoMode;
};

export type AdcSample = {
    timestamp: number;
    vBat: number;
    iBat: number;
    tBat: number;
    soc?: number;
};

// 'connected' -> Shell ok - PMIC Online
// 'disconnected' -> Shell ok - PMIC disconnected
// 'offline' -> Shell off - PMIC disconnected
export type PmicState = 'offline' | 'connected' | 'disconnected';

export type PmicChargingState = {
    toBeDefinedBetter?: boolean; // Documentation is wrong for this and should not be used to detected if battery is connected or not
    batteryFull: boolean;
    trickleCharge: boolean;
    constantCurrentCharging: boolean;
    constantVoltageCharging: boolean;
    batteryRechargeNeeded: boolean;
    dieTempHigh: boolean;
    supplementModeActive: boolean;
};

export type BaseNpmDevice = {
    kernelReset: (mode: 'cold' | 'warm', callback?: () => void) => void;
    onPmicStateChange: (
        handler: (state: PmicState, error?: string) => void
    ) => () => void;
    onAdcSample: (
        handler: (sample: AdcSample, error?: string) => void
    ) => () => void;
    onChargingStatusUpdate: (
        handler: (payload: PmicChargingState, error?: string) => void
    ) => () => void;
    onChargerUpdate: (
        handler: (payload: PartialUpdate<Charger>, error?: string) => void
    ) => () => void;
    onBuckUpdate: (
        handler: (payload: PartialUpdate<Buck>, error?: string) => void
    ) => () => void;

    onFuelGaugeUpdate: (handler: (payload: boolean) => void) => () => void;

    onLdoUpdate: (
        handler: (payload: PartialUpdate<Ldo>, error?: string) => void
    ) => () => void;
    getNumberOfChargers: () => number;
    getNumberOfBucks: () => number;
    getNumberOfLdos: () => number;

    isSupportedVersion: () => Promise<boolean>;
    getSupportedVersion: () => string;
};

export type NpmDevice = {
    getConnectionState: () => PmicState;

    startAdcSample: (intervalMs: number) => void;

    getChargerCurrentRange: (index: number) => RangeType;
    getChargerVoltageRange: (index: number) => number[];
    getBuckVoltageRange: (index: number) => RangeType;
    getLdoVoltageRange: (index: number) => RangeType;

    requestUpdate: {
        pmicChargingState: () => void;
        chargerVTerm: (index: number) => void;
        chargerIChg: (index: number) => void;
        chargerEnabled: (index: number) => void;

        buckVOut: (index: number) => void;
        buckMode: (index: number) => void;
        buckEnabled: (index: number) => void;

        ldoVoltage: (index: number) => void;
        ldoEnabled: (index: number) => void;
        ldoMode: (index: number) => void;

        fuelGauge: () => void;
    };

    setChargerVTerm: (index: number, value: number) => void;
    setChargerIChg: (index: number, value: number) => void;
    setChargerEnabled: (index: number, state: boolean) => void;

    setBuckVOut: (index: number, value: number) => void;
    setBuckMode: (index: number, mode: BuckMode) => void;
    setBuckEnabled: (index: number, state: boolean) => void;

    setLdoVoltage: (index: number, value: number) => void;
    setLdoEnabled: (index: number, state: boolean) => void;
    setLdoMode: (index: number, mode: LdoMode) => void;

    setFuelGaugeEnabled: (state: boolean) => void;
} & BaseNpmDevice;
