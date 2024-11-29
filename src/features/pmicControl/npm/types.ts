/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';

import { RangeType } from '../../../utils/helpers';
import type {
    GPIODrive1300,
    GPIOMode1300,
    GPIOPull1300,
} from './npm1300/gpio/types';
import type {
    GPIODrive2100,
    GPIOMode2100,
    GPIOPull2100,
} from './npm2100/gpio/types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlPinSelect,
    nPM2100LdoModeControl,
    nPM2100LDOSoftStart,
    nPM2100LoadSwitchSoftStart,
    npm2100LongPressResetDebounce,
    npm2100ResetPinSelection,
    npm2100TimerMode,
} from './npm2100/types';

export type PartialUpdate<T> = { index: number; data: Partial<T> };

export const GPIOValues = [
    'GPIO0',
    'GPIO1',
    'GPIO2',
    'GPIO3',
    'GPIO4',
    'GPIO5',
] as const;

export const LdoOnOffControlValues = ['SW'] as const;

export const BoostModeControlValues = [
    'AUTO',
    'NOHP',
    'LP',
    'HP',
    'PASS',
] as const;
export const BoostPinModeValues = ['LP', 'HP', 'PASS', 'NOHP'] as const;
export const BoostPinSelectionValues = [
    'OFF',
    'GPIO0LO',
    'GPIO0HI',
    'GPIO1LO',
    'GPIO1HI',
] as const;

export const BuckModeControlValues = ['Auto', 'PWM', 'PFM'] as const;
export const BuckOnOffControlValues = ['Off'] as const;
export const BuckRetentionControlValues = ['Off'] as const;

type GPIONames = (typeof GPIOValues)[number];
export type RebootMode = 'cold' | 'warm';
export const LdoModeValues = ['Load_switch', 'LDO'] as const;
export type LdoMode = (typeof LdoModeValues)[number];
export const SoftStartValues = [10, 20, 35, 50, undefined] as const;
export type Npm1300LoadSwitchSoftStart = (typeof SoftStartValues)[number];
export type LdoOnOffControl =
    | (typeof LdoOnOffControlValues)[number]
    | GPIONames;

export const BoostVOutSelValues = ['Vset', 'Software'] as const;
export type BoostVOutSel = (typeof BoostVOutSelValues)[number];
export type BoostModeControl = (typeof BoostModeControlValues)[number];
export type BoostPinMode = (typeof BoostPinModeValues)[number];
export type BoostPinSelection = (typeof BoostPinSelectionValues)[number];

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
export const NTCValues = ['Ignore NTC', '10 kΩ', '47 kΩ', '100 kΩ'] as const;
export type VTrickleFast = (typeof VTrickleFastValues)[number];
export type NTCThermistor = (typeof NTCValues)[number];

export type CCProfilingState =
    | 'Off'
    | 'Running'
    | 'vCutOff'
    | 'POF'
    | 'ThermalError'
    | 'Ready';

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

export type FuelGauge = {
    enabled: boolean;
    notChargingSamplingRate: number;
    reportingRate: number;
    chargingSamplingRate?: number;
    activeBatterModel?: BatteryModel;
};

export type Charger = {
    vTerm: number;
    vTrickleFast: VTrickleFast;
    iChg: number;
    enabled: boolean;
    enableRecharging: boolean;
    enableVBatLow: boolean;
    iTerm: ITerm;
    iBatLim: number;
    ntcThermistor: NTCThermistor;
    ntcBeta: number;
    tChgStop: number;
    tChgResume: number;
    vTermR: number;
    tCold: number;
    tCool: number;
    tWarm: number;
    tHot: number;
};

export type Boost = {
    vOutVSet: number;
    vOutSoftware: number;
    vOutSelect: BoostVOutSel;
    modeControl: BoostModeControl;
    pinSelection: BoostPinSelection;
    pinMode: BoostPinMode;
    pinModeEnabled: boolean;
    overCurrentProtection: boolean;
};

export type Buck = {
    vOutNormal: number;
    vOutRetention: number;
    mode: BuckMode;
    modeControl: BuckModeControl;
    onOffControl: BuckOnOffControl;
    onOffSoftwareControlEnabled: boolean;
    retentionControl: BuckRetentionControl;
    enabled: boolean;
    activeDischarge: boolean;
};

export type Ldo = {
    voltage: number;
    enabled: boolean;
    mode: LdoMode;
    modeControl?: nPM2100LdoModeControl;
    pinSel?: nPM2100GPIOControlPinSelect;
    pinMode?: nPM2100GPIOControlMode;
    ocpEnabled?: boolean;
    rampEnabled?: boolean;
    haltEnabled?: boolean;
    softStartEnabled: boolean;
    softStart?: Npm1300LoadSwitchSoftStart;
    loadSwitchSoftStart?: nPM2100LoadSwitchSoftStart;
    ldoSoftStart?: nPM2100LDOSoftStart;
    activeDischarge: boolean;
    onOffControl: LdoOnOffControl;
    onOffSoftwareControlEnabled: boolean;
};

export type GPIOMode = GPIOMode1300 | GPIOMode2100;
export type GPIOPull = GPIOPull1300 | GPIOPull2100;
export type GPIODrive = GPIODrive1300 | GPIODrive2100;

export type GPIO = {
    mode: GPIOMode;
    pull: GPIOPull;
    pullEnabled: boolean;
    drive: GPIODrive;
    driveEnabled: boolean;
    openDrain: boolean;
    openDrainEnabled: boolean;
    debounce: boolean;
    debounceEnabled: boolean;
};

export const LEDModeValues = [
    'Charger error',
    'Charging',
    'Host',
    'Not used',
] as const;
export type LEDMode = (typeof LEDModeValues)[number];

export type LED = {
    mode: LEDMode;
};

export const POFPolarityValues = ['Active low', 'Active high'] as const;
export type POFPolarity = (typeof POFPolarityValues)[number];

export type POF = {
    enable: boolean;
    polarity: POFPolarity;
    threshold: number;
};

export enum npm1300TimerMode {
    'Boot monitor' = '0',
    'Watchdog warning' = '1',
    'Watchdog reset' = '2',
    'General purpose' = '3',
    'Wakeup' = '4',
}
export type TimerMode = npm1300TimerMode | npm2100TimerMode;

export const TimerPrescalerValues = ['Slow', 'Fast'] as const;
export type TimerPrescaler = (typeof TimerPrescalerValues)[number];

export type TimerConfig = npm1300TimerConfig | npm2100TimerConfig;

export type npm1300TimerConfig = {
    mode: npm1300TimerMode;
    prescaler: TimerPrescaler;
    period: number;
};
export type npm2100TimerConfig = {
    mode: npm2100TimerMode;
    enabled: boolean;
    period: number;
};

export const TimeToActiveValues = [
    16, 32, 64, 96, 304, 608, 1008, 3008,
] as const;
export type TimeToActive = (typeof TimeToActiveValues)[number];

export const LongPressResetValues = [
    'one_button',
    'disabled',
    'two_button',
] as const;
export type LongPressReset = (typeof LongPressResetValues)[number];

export type LowPowerConfig = {
    timeToActive: TimeToActive;
    invPolarity: boolean;
};

export type ResetConfig = npm1300ResetConfig | npm2100ResetConfig;

export type npm1300ResetConfig = {
    longPressReset: LongPressReset;
};

/*
export const npm2100ResetPinSelectionValues = ['PG/RESET', 'SHPHLD'] as const;
export type npm2100ResetPinSelection =
    (typeof npm2100ResetPinSelectionValues)[number];
*/

export type npm2100ResetReason = {
    reason?: string;
    bor?: string;
};

export type npm2100ResetConfig = {
    longPressResetEnable: boolean;
    longPressResetDebounce: npm2100LongPressResetDebounce;
    resetPinSelection: npm2100ResetPinSelection;
    resetReason?: npm2100ResetReason;
};

export type AdcSample = {
    timestamp: number;
    vBat: number;
    iBat?: number;
    tBat?: number;
    tDie?: number;
    soc?: number;
    tte?: number;
    ttf?: number;
};

export type BatteryModelCharacterization = {
    temperature?: number;
    capacity: number;
};

export type BatteryClass = 'LiPo' | 'Primary';

export type BatteryModel = {
    name: string;
    characterizations: BatteryModelCharacterization[];
    slotIndex?: number;
    batteryClass?: BatteryClass;
};

export const USBDetectStatusValues = [
    'No USB connection',
    'USB 100/500 mA',
    '1.5A High Power',
    '3A High Power',
] as const;
export type USBDetectStatus = (typeof USBDetectStatusValues)[number];

export type USBPower = {
    detectStatus: USBDetectStatus;
    currentLimiter: number;
};

export type ErrorLogs = {
    resetCause?: string[];
    chargerError?: string[];
    sensorError?: string[];
};

export type SupportedErrorLogs = {
    reset: boolean;
    charger: boolean;
    sensor: boolean;
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
            noOfBucks?: number;
            noOfLdos?: number;
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
    slot?: number;
}

export type FixedListRange = number[] | FixedListRangeWithLabel;
export type FixedListRangeWithLabel = number[] & {
    toLabel: (value: number) => string;
};

export type RangeOrFixedListRange = RangeType | FixedListRange;

export const isFixedListRange = (
    range: RangeOrFixedListRange
): range is FixedListRange => Array.isArray(range);

export const isFixedListRangeWithLabel = (
    range: RangeOrFixedListRange
): range is FixedListRangeWithLabel =>
    Array.isArray(range) &&
    (range as FixedListRangeWithLabel).toLabel !== undefined;

export const isRangeType = (range: RangeOrFixedListRange): range is RangeType =>
    !Array.isArray(range);

export interface FuelGaugeModule {
    get: {
        all: () => void;
        enabled: () => void;
        activeBatteryModel: () => void;
        storedBatteryModel: () => void;
    };
    set: {
        all: (config: FuelGaugeExport) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;
        activeBatteryModel: (name: string) => Promise<void>;
        batteryStatusCheckEnabled: (enabled: boolean) => Promise<void>;
    };
    actions: {
        abortDownloadFuelGaugeProfile: () => Promise<void>;
        applyDownloadFuelGaugeProfile: (slot?: number) => Promise<void>;
        downloadFuelGaugeProfile: (
            profile: Buffer,
            slot?: number
        ) => Promise<void>;
        reset: () => Promise<void>;
    };
    callbacks: (() => void)[];
    defaults: FuelGauge;
}

export interface ChargerModule {
    get: {
        all: () => void;
        state: () => void;
        vTerm: () => void;
        iChg: () => void;
        enabled: () => void;
        vTrickleFast: () => void;
        iTerm: () => void;
        batLim: () => void;
        enabledRecharging: () => void;
        enabledVBatLow: () => void;
        nTCThermistor: () => void;
        nTCBeta: () => void;
        tChgStop: () => void;
        tChgResume: () => void;
        vTermR: () => void;
        tCold: () => void;
        tCool: () => void;
        tWarm: () => void;
        tHot: () => void;
    };
    set: {
        all(charger: Charger): Promise<void>;
        vTerm: (value: number) => Promise<void>;
        iChg: (value: number) => Promise<void>;
        enabled: (value: boolean) => Promise<void>;
        vTrickleFast: (value: VTrickleFast) => Promise<void>;
        iTerm: (iTerm: ITerm) => Promise<void>;
        batLim: (value: number) => Promise<void>;
        enabledRecharging: (value: boolean) => Promise<void>;
        enabledVBatLow: (value: boolean) => Promise<void>;
        nTCThermistor: (
            mode: NTCThermistor,
            autoSetBeta?: boolean
        ) => Promise<void>;
        nTCBeta: (value: number) => Promise<void>;
        tChgStop: (value: number) => Promise<void>;
        tChgResume: (value: number) => Promise<void>;
        vTermR: (value: number) => Promise<void>;
        tCold: (value: number) => Promise<void>;
        tCool: (value: number) => Promise<void>;
        tWarm: (value: number) => Promise<void>;
        tHot: (value: number) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: number[];
        vTermR: number[];
        jeita: RangeType;
        chipThermal: RangeType;
        current: RangeType;
        nTCBeta: RangeType;
        iBatLim: FixedListRange;
    };
    defaults: Charger;
}

export interface BoostModule {
    get: {
        all: () => void;
        vOutVSet: () => void;
        vOutSoftware: () => void;
        vOutSel: () => void;
        modeControl: () => void;
        pinSelection: () => void;
        pinMode: () => void;
        overCurrent: () => void;
    };
    set: {
        all: (config: BoostExport) => Promise<void>;
        vOut: (value: number) => Promise<void>;
        vOutSel: (mode: BoostVOutSel) => Promise<void>;
        modeControl: (modeControl: BoostModeControl) => Promise<void>;
        pinSelection: (pinSelection: BoostPinSelection) => Promise<void>;
        pinMode: (pinMode: BoostPinMode) => Promise<void>;
        overCurrent: (enabled: boolean) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: RangeType;
    };
    defaults: Boost;
}

export interface BuckModule {
    index: number;
    get: {
        all: () => void;
        vOutNormal: () => void;
        vOutRetention: () => void;
        mode: () => void;
        enabled: () => void;
        modeControl: () => void;
        onOffControl: () => void;
        retentionControl: () => void;
        activeDischarge: () => void;
    };
    set: {
        all: (config: BuckExport) => Promise<void>;
        vOutNormal: (value: number) => Promise<void>;
        vOutRetention: (value: number) => Promise<void>;
        mode: (mode: BuckMode) => Promise<void>;
        modeControl: (modeControl: BuckModeControl) => Promise<void>;
        onOffControl: (onOffControl: BuckOnOffControl) => Promise<void>;
        retentionControl: (
            retentionControl: BuckRetentionControl
        ) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;
        activeDischarge: (activeDischarge: boolean) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: RangeType;
        retVOut: RangeType;
    };
    defaults: Buck;
}

export interface LdoModule {
    index: number;
    get: {
        all: () => void;
        voltage: () => void;
        enabled: () => void;
        mode: () => void;
        softStartEnabled?: () => void;
        softStart?: () => void;
        activeDischarge?: () => void;
        onOffControl?: () => void;
        modeCtrl?: () => void;
        pinSel?: () => void;
        softStartLdo?: () => void;
        softStartLoadSw?: () => void;
        pinMode?: () => void;
        ocp?: () => void;
        ramp?: () => void;
        halt?: () => void;
    };
    set: {
        all: (config: LdoExport) => Promise<void>;
        voltage: (value: number) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;
        mode: (mode: LdoMode) => Promise<void>;
        softStartEnabled?: (enabled: boolean) => Promise<void>;
        softStart?: (softStart: Npm1300LoadSwitchSoftStart) => Promise<void>;
        activeDischarge?: (activeDischarge: boolean) => Promise<void>;
        onOffControl?: (onOffControl: LdoOnOffControl) => Promise<void>;
        modeControl?: (modeCtrl: nPM2100LdoModeControl) => Promise<void>;
        pinSel?: (pinSel: nPM2100GPIOControlPinSelect) => Promise<void>;
        ldoSoftstart?: (softStartLdo: nPM2100LDOSoftStart) => Promise<void>;
        loadSwitchSoftstart?: (
            softStartLoadSw: nPM2100LoadSwitchSoftStart
        ) => Promise<void>;
        pinMode?: (pinMode: nPM2100GPIOControlMode) => Promise<void>;
        ocpEnabled?: (ocp: boolean) => Promise<void>;
        rampEnabled?: (ramp: boolean) => Promise<void>;
        haltEnabled?: (halt: boolean) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: RangeType;
    };
    defaults: Ldo;
}
export type GpioModule = {
    index: number;
    get: {
        all: () => void;
        mode: () => void;
        pull: () => void;
        drive: () => void;
        openDrain: () => void;
        debounce: () => void;
    };
    set: {
        all: (gpio: GPIOExport) => Promise<void>;
        mode: (mode: GPIOMode) => Promise<void>;
        pull: (pull: GPIOPull) => Promise<void>;
        drive: (drive: GPIODrive) => Promise<void>;
        openDrain: (openDrain: boolean) => Promise<void>;
        debounce: (debounce: boolean) => Promise<void>;
    };
    values: {
        mode: { label: string; value: GPIOMode }[];
        pull: { label: string; value: GPIOPull }[];
        drive: { label: string; value: GPIODrive }[];
    };
    callbacks: (() => void)[];
    defaults: GPIO;
};

export interface PofModule {
    get: {
        all: () => void;
        enable: () => void;
        polarity: () => void;
        threshold: () => void;
    };
    set: {
        all(pof: POF): Promise<void>;
        enabled(enable: boolean): Promise<void>;
        threshold(threshold: number): Promise<void>;
        polarity(polarity: POFPolarity): Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        threshold: RangeType;
    };
    defaults: POF;
}

export type TimerConfigModule = {
    get: {
        all: () => void;
        mode: () => void;
        prescaler?: () => void;
        enabled?: () => void;
        period: () => void;
    };
    set: {
        all(timerConfig: TimerConfig): Promise<void>;
        mode(mode: TimerMode): Promise<void>;
        prescaler?(prescaler: TimerPrescaler): Promise<void>;
        enabled?(enabled: boolean): Promise<void>;
        period(period: number): Promise<void>;
    };
    values: {
        mode: { label: string; value: TimerMode }[];
    };
    callbacks: (() => void)[];
    ranges: {
        periodRange: (prescalerMultiplier: number) => RangeType;
    };
    defaults: TimerConfig;
    getPrescalerMultiplier?: (timerConfig: TimerConfig) => number;
};

export type LowPowerModule = {
    get: {
        all: () => void;
        timeToActive: () => void;
    };
    set: {
        all(lowPower: LowPowerConfig): Promise<void>;
        timeToActive(timeToActive: TimeToActive): Promise<void>;

        enterShipMode(): void;
        enterShipHibernateMode(): void;
    };
    callbacks: (() => void)[];
    defaults: LowPowerConfig;
};

export type ResetModule = {
    get: {
        all: () => void;
        longPressReset: () => void;
    };
    set: {
        all(reset: ResetConfig): Promise<void>;

        // npm1300
        longPressReset?: (longPressReset: LongPressReset) => Promise<void>;

        // npm2100
        longPressResetEnable?: (longPressResetEnable: boolean) => Promise<void>;
        longPressResetDebounce?: (
            longPressResetDebounce: npm2100LongPressResetDebounce
        ) => Promise<void>;
        selectResetPin?: (resetPin: npm2100ResetPinSelection) => Promise<void>;
        powerCycle?: () => Promise<void>;
    };
    values: {
        pinSelection: { label: string; value: npm2100ResetPinSelection }[];
    };
    callbacks: (() => void)[];
    defaults: ResetConfig;
};

export type UsbCurrentLimiterModule = {
    get: {
        all: () => void;
        vBusInCurrentLimiter: () => void;
        usbPowered: () => void;
    };
    set: {
        all(usb: USBPowerExport): Promise<void>;
        vBusInCurrentLimiter(amps: number): Promise<void>;
    };
    callbacks: (() => void)[];
    defaults: USBPower;
    ranges: {
        vBusInLimiter: number[];
    };
};

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
    onBatteryAddonBoardIdUpdate: (
        handler: (batteryAddonBoardId: number, error?: string) => void
    ) => () => void;
    onTimerExpiryInterrupt: (
        handler: (payload: string, error?: string) => void
    ) => () => void;
    onBoostUpdate: (
        handler: (payload: PartialUpdate<Boost>, error?: string) => void
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
    onPOFUpdate: (
        handler: (payload: Partial<POF>, error?: string) => void
    ) => () => void;
    onTimerConfigUpdate: (
        handler: (payload: Partial<TimerConfig>, error?: string) => void
    ) => () => void;
    onLowPowerUpdate: (
        handler: (payload: Partial<LowPowerConfig>, error?: string) => void
    ) => () => void;
    onResetUpdate: (
        handler: (payload: Partial<ResetConfig>, error?: string) => void
    ) => () => void;
    onBeforeReboot: (
        handler: (payload: number, error?: string) => void
    ) => () => void;
    onReboot: (
        handler: (success: boolean, error?: string) => void
    ) => () => void;

    onUsbPower: (
        handler: (payload: Partial<USBPower>, error?: string) => void
    ) => () => void;

    onErrorLogs: (
        handler: (payload: Partial<ErrorLogs>, error?: string) => void
    ) => () => void;

    clearErrorLogs?: (errorOnly?: boolean) => void;

    onFuelGaugeUpdate: (handler: (payload: boolean) => void) => () => void;

    supportedErrorLogs?: SupportedErrorLogs;

    onActiveBatteryModelUpdate: (
        handler: (payload: BatteryModel) => void
    ) => () => void;

    onStoredBatteryModelUpdate: (
        handler: (payload: BatteryModel[]) => void
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

    initialize: () => Promise<void>;

    hasMaxEnergyExtraction: () => boolean;
    getNumberOfLEDs: () => number;
    getNumberOfBatteryModelSlots: () => number;

    isSupportedVersion: () => Promise<{ supported: boolean; version: string }>;
    getSupportedVersion: () => string;
    getPmicVersion: () => Promise<number>;
    isPMICPowered: () => Promise<boolean>;

    getUptimeOverflowCounter: () => number;
    setUptimeOverflowCounter: (value: number) => void;
    release: () => void;

    generateOverlay?: (npmExport: NpmExportLatest) => string;

    chargerModule?: ChargerModule;
    gpioModule: GpioModule[];
    boostModule: BoostModule[];
    pofModule?: PofModule;
    lowPowerModule?: LowPowerModule;
    resetModule?: ResetModule;
    timerConfigModule?: TimerConfigModule;
    buckModule: BuckModule[];
    usbCurrentLimiterModule?: UsbCurrentLimiterModule;
    ldoModule: LdoModule[];
};

export interface INpmDevice extends IBaseNpmDevice {
    (
        shellParser: ShellParser | undefined,
        dialogHandler: ((pmicDialog: PmicDialog) => void) | null
    ): NpmDevice;
}

export type NpmDevice = {
    applyConfig: (config: NpmExportLatest) => void;
    getDeviceType: () => NpmModel;
    getConnectionState: () => PmicState;

    onProfileDownloadUpdate: (
        handler: (success: ProfileDownload, error?: string) => void
    ) => () => void;

    startAdcSample: (intervalMs: number, samplingRate: number) => Promise<void>;
    stopAdcSample: () => void;

    ledDefaults: () => LED[];

    getBatteryConnectedVoltageThreshold: () => number;

    requestUpdate: {
        all: () => void;
        ledMode: (index: number) => void;
    };

    setLedMode: (index: number, mode: LEDMode) => Promise<void>;

    fuelGaugeModule: FuelGaugeModule;
    // TODO
    getHardcodedBatteryModels: () => Promise<BatteryModel[]>;

    getBatteryProfiler?: () => BatteryProfiler | undefined;
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
    onConfirm: () => void | Promise<void>;
    onCancel: () => void | Promise<void>;
    onOptional?: () => void | Promise<void>;
    doNotAskAgainStoreID?: string;
    progress?: number;
}

export type NpmModel = 'npm1300' | 'npm2100';

export type FuelGaugeExport = Omit<
    FuelGauge,
    'notChargingSamplingRate' | 'reportingRate' | 'activeBatterModel'
>;
export type BoostExport = Omit<Boost, 'pinModeEnabled' | 'vOutVSet'>;
export type LdoExport = Omit<Ldo, 'onOffSoftwareControlEnabled'>;
export type BuckExport = Omit<Buck, 'onOffSoftwareControlEnabled'>;
export type GPIOExport = Omit<
    GPIO,
    'pullEnabled' | 'driveEnabled' | 'openDrainEnabled' | 'debounceEnabled'
>;
export type USBPowerExport = Omit<USBPower, 'detectStatus'>;

export interface NpmExportV1 {
    boosts: BoostExport[];
    charger?: Charger;
    bucks: BuckExport[];
    ldos: LdoExport[];
    gpios: GPIOExport[];
    leds: LED[];
    pof?: POF;
    lowPower?: LowPowerConfig;
    reset?: ResetConfig;
    timerConfig?: TimerConfig;
    fuelGaugeSettings: FuelGaugeExport;
    firmwareVersion: string;
    deviceType: NpmModel;
    usbPower?: USBPowerExport;
    fuelGauge: boolean; // legacy setting deprecated in v2.0.0
    fuelGaugeChargingSamplingRate: number; // legacy setting deprecated in v2.0.0
}

export interface NpmExportV2 {
    boosts: BoostExport[];
    charger?: Charger;
    bucks: BuckExport[];
    ldos: LdoExport[];
    gpios: GPIOExport[];
    leds: LED[];
    pof?: POF;
    lowPower?: LowPowerConfig;
    reset?: ResetConfig;
    timerConfig?: TimerConfig;
    fuelGaugeSettings: FuelGaugeExport;
    firmwareVersion: string;
    deviceType: NpmModel;
    usbPower?: USBPowerExport;
    fileFormatVersion: 2;
}

export type NpmExportLatest = NpmExportV2;

export type AnyNpmExport = NpmExportV1 | NpmExportV2 | NpmExportLatest;

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

interface DocumentationItem {
    title: React.ReactNode;
    content: React.ReactElement[];
}

export type Documentation = {
    [key: string]: {
        [key: string]: DocumentationItem[];
    };
};
