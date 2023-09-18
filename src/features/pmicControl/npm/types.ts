/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';

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

export const BuckModeControlValues = ['Auto'] as const; // TODO 'PWM', 'PFM'
export const BuckOnOffControlValues = ['Off'] as const;
export const BuckRetentionControlValues = ['Off'] as const;

type GPIONames = (typeof GPIOValues)[number];
export type RebootMode = 'cold' | 'warm';
export type LdoMode = 'ldoSwitch' | 'LDO';
export type BuckMode = 'vSet' | 'software';
export type BuckModeControl =
    | (typeof BuckModeControlValues)[number]
    | GPIONames;
export type BuckOnOffControl =
    | (typeof BuckOnOffControlValues)[number]
    | GPIONames;
export type BuckRetentionControl =
    | (typeof BuckRetentionControlValues)[number]
    | GPIONames;

export const ITermValues = ['10%', '20%'] as const;
export type ITerm = (typeof ITermValues)[number];

export const VTrickleFastValues = [2.5, 2.9] as const;
export const NTCValues = ['HI Z', '10 kΩ', '47 kΩ', '100 kΩ'] as const;
export type VTrickleFast = (typeof VTrickleFastValues)[number];
export type NTCThermistor = (typeof NTCValues)[number];

export type CCProfilingState =
    | 'Off'
    | 'Running'
    | 'vCutOff'
    | 'POF'
    | 'ThermalError'
    | 'Ready';

export type ChargeCurrentCool = 'iCHG' | 'iCool';

export type ProfilingEvent = {
    timestamp: number;
    data: ProfilingEventData;
};

export type ProfilingEventData = {
    iLoad: number;
    vLoad: number;
    tBat: number;
    cycle: number;
    seq: number;
    rep: number;
    tload: number;
};

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
    ntcThermistor: NTCThermistor;
    tChgStop: number;
    tChgResume: number;
    currentCool: ChargeCurrentCool;
    vTermR: number;
    tCold: number;
    tCool: number;
    tWarm: number;
    tHot: number;
};

export type Buck = {
    vOutNormal: number;
    vOutRetention: number;
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

export const GPIOModeValues = [
    'Input',
    'Input logic 1',
    'Input logic 0',
    'Input rising edge event',
    'Input falling edge event',
    'Output interrupt',
    'Output reset',
    'Output power loss warning',
    'Output logic 1',
    'Output logic 0',
] as const;
export type GPIOMode = (typeof GPIOModeValues)[number];

export const GPIOPullValues = ['pull down', 'pull up', 'pull disable'] as const;
export type GPIOPullMode = (typeof GPIOPullValues)[number];

export const GPIODriveValues = [1, 6] as const;
export type GPIODrive = (typeof GPIODriveValues)[number];

export type GPIO = {
    mode: GPIOMode;
    pull: GPIOPullMode;
    drive: GPIODrive;
    openDrain: boolean;
    debounce: boolean;
};

export const LEDModeValues = [
    'Charger error',
    'Charging',
    'HOST',
    'Not used',
] as const;
export type LEDMode = (typeof LEDModeValues)[number];

export type LED = {
    mode: LEDMode;
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
// 'pmic-pending-reboot' -> Shell ok - PMIC need restart to proceed
// 'pmic-pending-rebooting' -> Shell ok - PMIC will reboot soon
// 'ek-disconnected' -> Shell off - PMIC disconnected
export type PmicState =
    | 'ek-disconnected'
    | 'pmic-connected'
    | 'pmic-disconnected'
    | 'pmic-pending-reboot'
    | 'pmic-pending-rebooting';

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
        dialogHandler: ((pmicDialog: PmicDialog) => void) | null,
        eventEmitter: EventEmitter,
        devices: {
            charger?: boolean;
            noOfBucks?: number;
            noOfLdos?: number;
            noOfGPIOs?: number;
            noOfLEDs?: number;
        },
        supportsVersion: string
    ): BaseNpmDevice;
}

export interface ProfileDownload {
    state: 'downloading' | 'aborted' | 'aborting' | 'applied' | 'failed';
    completeChunks?: number;
    totalChunks?: number;
    alertMessage?: string;
}

export type BaseNpmDevice = {
    kernelReset: () => void;
    getKernelUptime: () => Promise<number>;
    onPmicStateChange: (
        handler: (state: PmicState, error?: string) => void
    ) => () => void;
    onAdcSample: (
        handler: (sample: AdcSample, error?: string) => void
    ) => () => void;
    onAdcSettingsChange: (
        handler: (payload: AdcSampleSettings) => void
    ) => () => void;
    onChargingStatusUpdate: (
        handler: (payload: PmicChargingState, error?: string) => void
    ) => () => void;
    onChargerUpdate: (
        handler: (payload: Partial<Charger>, error?: string) => void
    ) => () => void;
    onBuckUpdate: (
        handler: (payload: PartialUpdate<Buck>, error?: string) => void
    ) => () => void;
    onGPIOUpdate: (
        handler: (payload: PartialUpdate<GPIO>, error?: string) => void
    ) => () => void;
    onLEDUpdate: (
        handler: (payload: PartialUpdate<LED>, error?: string) => void
    ) => () => void;
    onBeforeReboot: (
        handler: (payload: number, error?: string) => void
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
        handler: (payload: (BatteryModel | null)[]) => void
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

    hasCharger: () => boolean;
    getNumberOfBucks: () => number;
    getNumberOfLdos: () => number;
    getNumberOfGPIOs: () => number;
    getNumberOfLEDs: () => number;

    isSupportedVersion: () => Promise<{ supported: boolean; version: string }>;
    getSupportedVersion: () => string;
    getPmicVersion: () => Promise<number>;

    getUptimeOverflowCounter: () => number;
    setUptimeOverflowCounter: (value: number) => void;
    release: () => void;
};

export interface INpmDevice extends IBaseNpmDevice {
    (
        shellParser: ShellParser | undefined,
        dialogHandler: ((pmicDialog: PmicDialog) => void) | null
    ): NpmDevice;
}

export type NpmDevice = {
    applyConfig: (config: NpmExport) => void;
    getDeviceType: () => NpmModel;
    getConnectionState: () => PmicState;

    onProfileDownloadUpdate: (
        handler: (success: ProfileDownload, error?: string) => void
    ) => () => void;

    startAdcSample: (intervalMs: number, samplingRate: number) => void;
    stopAdcSample: () => void;

    getChargerCurrentRange: () => RangeType;
    getChargerVoltageRange: () => number[];
    getChargerVTermRRange: () => number[];
    getChargerJeitaRange: () => RangeType;
    getChargerChipThermalRange: () => RangeType;
    getBuckVoltageRange: (index: number) => RangeType;
    getBuckRetVOutRange: (index: number) => RangeType;
    getLdoVoltageRange: (index: number) => RangeType;

    requestUpdate: {
        pmicChargingState: () => void;
        chargerVTerm: () => void;
        chargerIChg: () => void;
        chargerEnabled: () => void;
        chargerVTrickleFast: () => void;
        chargerITerm: () => void;
        chargerEnabledRecharging: () => void;
        chargerNTCThermistor: () => void;
        chargerTChgStop: () => void;
        chargerTChgResume: () => void;
        chargerCurrentCool: () => void;
        chargerVTermR: () => void;
        chargerTCold: () => void;
        chargerTCool: () => void;
        chargerTWarm: () => void;
        chargerTHot: () => void;

        buckVOutNormal: (index: number) => void;
        buckVOutRetention: (index: number) => void;
        buckMode: (index: number) => void;
        buckModeControl: (index: number) => void;
        buckOnOffControl: (index: number) => void;
        buckRetentionControl: (index: number) => void;
        buckEnabled: (index: number) => void;

        ldoVoltage: (index: number) => void;
        ldoEnabled: (index: number) => void;
        ldoMode: (index: number) => void;

        gpioMode: (index: number) => void;
        gpioPull: (index: number) => void;
        gpioDrive: (index: number) => void;
        gpioOpenDrain: (index: number) => void;
        gpioDebounce: (index: number) => void;

        ledMode: (index: number) => void;

        fuelGauge: () => void;

        activeBatteryModel: () => void;
        storedBatteryModel: () => void;

        usbPowered: () => void;
    };

    setChargerVTerm: (value: number) => Promise<void>;
    setChargerIChg: (value: number) => Promise<void>;
    setChargerEnabled: (state: boolean) => Promise<void>;
    setChargerVTrickleFast: (value: VTrickleFast) => Promise<void>;
    setChargerITerm: (iTerm: ITerm) => Promise<void>;
    setChargerEnabledRecharging: (enabled: boolean) => Promise<void>;
    setChargerNTCThermistor: (mode: NTCThermistor) => Promise<void>;
    setChargerTChgStop: (value: number) => Promise<void>;
    setChargerTChgResume: (value: number) => Promise<void>;
    setChargerCurrentCool: (mode: ChargeCurrentCool) => Promise<void>;
    setChargerVTermR: (value: number) => Promise<void>;
    setChargerTCold: (value: number) => Promise<void>;
    setChargerTCool: (value: number) => Promise<void>;
    setChargerTWarm: (value: number) => Promise<void>;
    setChargerTHot: (value: number) => Promise<void>;

    setBuckVOutNormal: (index: number, value: number) => Promise<void>;
    setBuckVOutRetention: (index: number, value: number) => Promise<void>;
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

    setGpioMode: (index: number, mode: GPIOMode) => Promise<void>;
    setGpioPull: (index: number, mode: GPIOPullMode) => Promise<void>;
    setGpioDrive: (index: number, drive: GPIODrive) => Promise<void>;
    setGpioOpenDrain: (index: number, openDrain: boolean) => Promise<void>;
    setGpioDebounce: (index: number, debounce: boolean) => Promise<void>;

    setLedMode: (index: number, mode: LEDMode) => Promise<void>;

    setFuelGaugeEnabled: (state: boolean) => Promise<void>;
    downloadFuelGaugeProfile: (profile: Buffer) => Promise<void>;
    abortDownloadFuelGaugeProfile: () => Promise<void>;
    applyDownloadFuelGaugeProfile: () => Promise<void>;
    getHardcodedBatteryModels: () => Promise<BatteryModel[]>;
    setActiveBatteryModel: (name: string) => Promise<void>;

    setBatteryStatusCheckEnabled: (enabled: boolean) => void;

    getBatteryProfiler: () => BatteryProfiler | undefined;
    setAutoRebootDevice: (autoReboot: boolean) => void;
} & BaseNpmDevice;

export interface PmicDialog {
    uuid?: string;
    type?: 'alert' | 'alert-circle' | 'information';
    message: string | React.ReactNode;
    optionalLabel?: string;
    optionalDisabled?: boolean;
    optionalClosesDialog?: boolean;
    confirmLabel: string;
    confirmDisabled?: boolean;
    confirmClosesDialog?: boolean;
    cancelLabel: string;
    cancelDisabled?: boolean;
    cancelClosesDialog?: boolean;
    title: string;
    onConfirm: () => void;
    onCancel: () => void;
    onOptional?: () => void;
    doNotAskAgainStoreID?: string;
    progress?: number;
}

export type NpmModel = 'npm1300';

export interface NpmExport {
    charger?: Charger;
    bucks: Buck[];
    ldos: Ldo[];
    gpios: GPIO[];
    leds: LED[];
    fuelGauge: boolean;
    firmwareVersion: string;
    deviceType: NpmModel;
    fuelGaugeChargingSamplingRate: number;
}

export interface LoggingEvent {
    timestamp: number;
    logLevel: string;
    module: string;
    message: string;
}

export interface AdcSampleSettings {
    samplingRate: number;
    reportRate: number;
}

export interface CCProfile {
    tLoad: number;
    tRest: number;
    iLoad: number;
    iRest: number;
    cycles?: number;
    vCutoff?: number;
}

export interface Profile {
    name: string;
    vLowerCutOff: number;
    vUpperCutOff: number;
    capacity: number;
    ratedChargingCurrent: number;
    ntcThermistor: NTCThermistor;
    temperatures: number[];
    baseDirectory: string;
    restingProfiles: CCProfile[];
    profilingProfiles: CCProfile[];
}

export interface IBatteryProfiler {
    (shellParser: ShellParser, eventEmitter: EventEmitter): BatteryProfiler;
}

export type BatteryProfiler = {
    release: () => void;
    setProfile: (
        reportIntervalCc: number,
        reportIntervalNtc: number,
        vCutoff: number,
        profiles: CCProfile[]
    ) => Promise<void>;
    canProfile: () => Promise<boolean>;
    startProfiling: () => Promise<void>;
    stopProfiling: () => Promise<void>;
    isProfiling: () => Promise<boolean>;
    getProfilingState: () => CCProfilingState;
    onProfilingStateChange: (
        handler: (state: CCProfilingState, error?: string) => void
    ) => () => void;
    onProfilingEvent: (
        handler: (state: ProfilingEvent, error?: string) => void
    ) => () => void;
    pofError: () => void;
};

export type Documentation = {
    [key: string]: {
        [key: string]: {
            title: React.ReactNode;
            description?: React.ReactNode;
        };
    };
};
