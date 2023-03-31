/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import EventEmitter from 'events';

import { ShellParser } from '../../../hooks/commandParser';
import { RangeType } from '../../../utils/helpers';

export type PartialUpdate<T> = { index: number; data: Partial<T> };

export const GPIOValues = [
    'GPIO0',
    'GPIO1',
    'GPIO2',
    'GPIO3',
    'GPIO4',
    'GPIO5',
] as const;

export const BuckModeControlValues = ['Auto', 'PWM', 'PFM'] as const;
export const BuckOnOffControlValues = ['Off'] as const;
export const BuckRetentionControlValues = ['Off'] as const;

export type GPIO = typeof GPIOValues[number];
export type RebootMode = 'cold' | 'warm';
export type LdoMode = 'ldoSwitch' | 'LDO';
export type BuckMode = 'vSet' | 'software';
export type BuckModeControl = typeof BuckModeControlValues[number] | GPIO;
export type BuckOnOffControl = typeof BuckOnOffControlValues[number] | GPIO;
export type BuckRetentionControl =
    | typeof BuckRetentionControlValues[number]
    | GPIO;

export const ITermValues = ['10%', '20%'] as const;
export type ITerm = typeof ITermValues[number];

export const VTrickleFastValues = [2.5, 2.9] as const;
export type VTrickleFast = typeof VTrickleFastValues[number];

export type IrqEvent = {
    type: string;
    event: string;
};

export type Charger = {
    vTerm: number;
    vTrickleFast: VTrickleFast;
    iChg: number;
    enabled: boolean;
    enableRecharging: boolean;
    iTerm: ITerm;
};

export type Buck = {
    vOut: number;
    retentionVOut: number;
    mode: BuckMode;
    modeControl: BuckModeControl;
    onOffControl: BuckOnOffControl;
    retentionControl: BuckRetentionControl;
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
    soc: number;
    tte: number;
    ttf: number;
};

export type BatteryModelCharacterization = {
    temperature: number;
    capacity: number;
};

export type BatteryModel = {
    name: string;
    characterizations: BatteryModelCharacterization[];
};

// 'pmic-connected' -> Shell ok - PMIC Online
// 'pmic-disconnected' -> Shell ok - PMIC disconnected
// 'pmic-unknown' -> Shell ok - PMIC unknown
// 'ek-disconnected' -> Shell off - PMIC disconnected
export type PmicState =
    | 'ek-disconnected'
    | 'pmic-connected'
    | 'pmic-disconnected'
    | 'pmic-unknown';

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

export interface IBaseNpmDevice {
    (
        shellParser: ShellParser | undefined,
        warningDialogHandler: (pmicWarningDialog: PmicWarningDialog) => void,
        eventEmitter: EventEmitter,
        devices: {
            noOfChargers?: number;
            noOfBucks?: number;
            noOfLdos?: number;
        },
        supportsVersion: string
    ): BaseNpmDevice;
}

export type BaseNpmDevice = {
    kernelReset: (mode: RebootMode) => void;
    getKernelUptime: () => Promise<number>;
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
    onBeforeReboot: (
        handler: (payload: RebootMode, error?: string) => void
    ) => () => void;
    onReboot: (
        handler: (success: boolean, error?: string) => void
    ) => () => void;

    onUsbPowered: (
        handler: (success: boolean, error?: string) => void
    ) => () => void;

    onFuelGaugeUpdate: (handler: (payload: boolean) => void) => () => void;

    onActiveBatteryModelUpdate: (
        handler: (payload: BatteryModel) => void
    ) => () => void;

    onStoredBatteryModelUpdate: (
        handler: (payload: BatteryModel | undefined) => void
    ) => () => void;

    onLoggingEvent: (
        handler: (payload: {
            loggingEvent: LoggingEvent;
            dataPair: boolean;
        }) => void
    ) => () => void;

    onLdoUpdate: (
        handler: (payload: PartialUpdate<Ldo>, error?: string) => void
    ) => () => void;
    getNumberOfChargers: () => number;
    getNumberOfBucks: () => number;
    getNumberOfLdos: () => number;
    getNumberOfGPIOs: () => number;

    isSupportedVersion: () => Promise<boolean>;
    getSupportedVersion: () => string;

    registerCommandCallbackLoggerWrapper: (
        command: string,
        onSuccess: (data: string, command: string) => void,
        onError: (error: string, command: string) => void
    ) => (() => void) | undefined;

    getUptimeOverflowCounter: () => number;
    setUptimeOverflowCounter: (value: number) => void;
};

export interface INpmDevice extends IBaseNpmDevice {
    (
        shellParser: ShellParser | undefined,
        warningDialogHandler: (pmicWarningDialog: PmicWarningDialog) => void
    ): NpmDevice;
}

export type NpmDevice = {
    applyConfig: (config: NpmExport) => void;
    getDeviceType: () => NpmModel;
    getConnectionState: () => PmicState;

    startAdcSample: (intervalMs: number) => void;
    stopAdcSample: () => void;

    getChargerCurrentRange: (index: number) => RangeType;
    getChargerVoltageRange: (index: number) => number[];
    getBuckVoltageRange: (index: number) => RangeType;
    getBuckRetVOutRange: (index: number) => RangeType;
    getLdoVoltageRange: (index: number) => RangeType;

    requestUpdate: {
        pmicChargingState: (index: number) => void;
        chargerVTerm: (index: number) => void;
        chargerIChg: (index: number) => void;
        chargerEnabled: (index: number) => void;
        chargerVTrickleFast: (index: number) => void;
        chargerITerm: (index: number) => void;
        chargerEnabledRecharging: (index: number) => void;

        buckVOut: (index: number) => void;
        buckRetentionVOut: (index: number) => void;
        buckMode: (index: number) => void;
        buckModeControl: (index: number) => void;
        buckOnOffControl: (index: number) => void;
        buckRetentionControl: (index: number) => void;
        buckEnabled: (index: number) => void;

        ldoVoltage: (index: number) => void;
        ldoEnabled: (index: number) => void;
        ldoMode: (index: number) => void;

        fuelGauge: () => void;

        activeBatteryModel: () => void;
        storedBatteryModel: () => void;

        usbPowered: () => void;
    };

    setChargerVTerm: (index: number, value: number) => Promise<void>;
    setChargerIChg: (index: number, value: number) => Promise<void>;
    setChargerEnabled: (index: number, state: boolean) => Promise<void>;
    setChargerVTrickleFast: (
        index: number,
        value: VTrickleFast
    ) => Promise<void>;
    setChargerITerm: (index: number, iTerm: ITerm) => Promise<void>;
    setChargerEnabledRecharging: (
        index: number,
        enabled: boolean
    ) => Promise<void>;

    setBuckVOut: (index: number, value: number) => Promise<void>;
    setBuckRetentionVOut: (index: number, value: number) => Promise<void>;
    setBuckMode: (index: number, mode: BuckMode) => Promise<void>;
    setBuckModeControl: (index: number, mode: BuckModeControl) => Promise<void>;
    setBuckOnOffControl: (
        index: number,
        mode: BuckOnOffControl
    ) => Promise<void>;
    setBuckRetentionControl: (
        index: number,
        mode: BuckRetentionControl
    ) => Promise<void>;
    setBuckEnabled: (index: number, state: boolean) => Promise<void>;

    setLdoVoltage: (index: number, value: number) => Promise<void>;
    setLdoEnabled: (index: number, state: boolean) => Promise<void>;
    setLdoMode: (index: number, mode: LdoMode) => Promise<void>;

    setFuelGaugeEnabled: (state: boolean) => Promise<void>;
    getDefaultBatteryModels: () => Promise<BatteryModel[]>;
    setActiveBatteryModel: (name: string) => Promise<void>;
    storeBattery: () => Promise<void>;

    setBatteryStatusCheckEnabled: (enabled: boolean) => void;
} & BaseNpmDevice;

export interface PmicWarningDialog {
    storeID: string;
    message: string;
    optionalLabel?: string;
    confirmLabel: string;
    cancelLabel: string;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    onOptional?: () => void;
    optionalDoNotAskAgain?: boolean;
}

export type NpmModel = 'npm1300';

export interface NpmExport {
    chargers: Charger[];
    bucks: Buck[];
    ldos: Ldo[];
    fuelGauge: boolean;
    firmwareVersion: string;
    deviceType: NpmModel;
}

export interface LoggingEvent {
    timestamp: number;
    logLevel: string;
    module: string;
    message: string;
}
