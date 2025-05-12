/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DropdownItem,
    ShellParser,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import EventEmitter from 'events';
import { z } from 'zod';

import { RangeType } from '../../../utils/helpers';
import type {
    GPIODrive1300,
    GPIOMode1300,
    GPIOPull1300,
} from './npm1300/gpio/types';
import type { SoftStart as SoftStart1300 } from './npm1300/ldo/types';
import type { PowerID2100 } from './npm2100/battery';
import type {
    GPIODrive2100,
    GPIOMode2100,
    GPIOPull2100,
    GPIOState2100,
} from './npm2100/gpio/types';
import {
    nPM2100GPIOControlMode,
    nPM2100GPIOControlPinSelect,
    nPM2100LdoModeControl,
    nPM2100LDOSoftStart,
    npm2100LongPressResetDebounce,
    npm2100ResetPinSelection,
    nPM2100SoftStart,
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
export type SoftStart = SoftStart1300 | nPM2100SoftStart;
export type LdoSoftStart = nPM2100LDOSoftStart;
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

export type ModuleSettings = {
    charger: boolean;
    maxEnergyExtraction: boolean;
    noOfBoosts: number;
    noOfBucks: number;
    noOfLdos: number;
    noOfLEDs: number;
    noOfBatterySlots: number;
    noOfGPIOs: number;
};

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

export type PowerID = PowerID2100;

export type FuelGauge = {
    enabled: boolean;
    notChargingSamplingRate: number;
    reportingRate: number;
    chargingSamplingRate?: number;
    activeBatterModel?: BatteryModel;
    discardPosiiveDeltaZ?: boolean;
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
    softStart: SoftStart;
    ldoSoftStart?: LdoSoftStart;
    activeDischarge: boolean;
    onOffControl: LdoOnOffControl;
    onOffSoftwareControlEnabled: boolean;
};

export type GPIOState = GPIOState2100;
export type GPIOMode = GPIOMode1300 | GPIOMode2100;
export type GPIOPull = GPIOPull1300 | GPIOPull2100;
export type GPIODrive = GPIODrive1300 | GPIODrive2100;

export type GPIO = {
    mode: GPIOMode;
    state?: GPIOState;
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
    'Wake-up' = '4',
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

export enum npm1300TimeToActive {
    '16ms' = '16',
    '32ms' = '32',
    '64ms' = '64',
    '96ms' = '96',
    '304ms' = '304',
    '608ms' = '608',
    '1008ms' = '1008',
    '3008ms' = '3008',
}

export enum npm2100TimeToActive {
    'DISABLE' = 'OFF',
    '10ms' = '10',
    '30ms' = '30',
    '60ms' = '60',
    '100ms' = '100',
    '300ms' = '300',
    '600ms' = '600',
    '1s' = '1000',
    '3s' = '3000',
}

export type TimeToActive = npm1300TimeToActive | npm2100TimeToActive;

export const LongPressResetValues = [
    'one_button',
    'disabled',
    'two_button',
] as const;
export type LongPressReset = (typeof LongPressResetValues)[number];

export type LowPowerConfig = npm1300LowPowerConfig | npm2100LowPowerConfig;

export type npm1300LowPowerConfig = {
    timeToActive: npm1300TimeToActive;
    invPolarity: boolean;
};

export type npm2100LowPowerConfig = {
    timeToActive: npm2100TimeToActive;
    powerButtonEnable: boolean;
};

export type ResetConfig = npm1300ResetConfig | npm2100ResetConfig;

export type npm1300ResetConfig = {
    longPressReset: LongPressReset;
};

export type npm2100ResetReason = {
    reason?: string;
    bor?: string;
};

export type LongPressResetDebounce = npm2100LongPressResetDebounce;
export type ResetPinSelection = npm2100ResetPinSelection;

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
        discardPosiiveDeltaZ?: () => void;
    };
    set: {
        all: (config: FuelGaugeExport) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;
        activeBatteryModel: (name: string) => Promise<void>;
        batteryStatusCheckEnabled?: (enabled: boolean) => Promise<void>;
        discardPosiiveDeltaZ?: (value: boolean) => void;
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
        vLowerCutOff?: RangeType;
    };
    defaults: Charger;
}

export interface BoostModule {
    index: number;
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
        softStart: () => void;
        activeDischarge?: () => void;
        onOffControl?: () => void;
        modeCtrl?: () => void;
        pinSel?: () => void;
        softStartLdo?: () => void;
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
        softStart: (softStart: SoftStart) => Promise<void>;
        activeDischarge?: (activeDischarge: boolean) => Promise<void>;
        onOffControl?: (onOffControl: LdoOnOffControl) => Promise<void>;
        modeControl?: (modeCtrl: nPM2100LdoModeControl) => Promise<void>;
        pinSel?: (pinSel: nPM2100GPIOControlPinSelect) => Promise<void>;
        ldoSoftstart?: (softStartLdo: LdoSoftStart) => Promise<void>;
        pinMode?: (pinMode: nPM2100GPIOControlMode) => Promise<void>;
        ocpEnabled?: (ocp: boolean) => Promise<void>;
        rampEnabled?: (ramp: boolean) => Promise<void>;
        haltEnabled?: (halt: boolean) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: RangeType;
    };
    values: {
        softstart: { label: string; value: SoftStart }[];
        ldoSoftstart?: { label: string; value: LdoSoftStart }[];
    };
    defaults: Ldo;
}
export type GpioModule = {
    index: number;
    get: {
        all: () => void;
        mode: () => void;
        state?: () => void;
        pull: () => void;
        drive: () => void;
        openDrain: () => void;
        debounce: () => void;
    };
    set: {
        all: (gpio: GPIOExport) => Promise<void>;
        mode: (mode: GPIOMode) => Promise<void>;
        state?: (state: GPIOState) => Promise<void>;
        pull: (pull: GPIOPull) => Promise<void>;
        drive: (drive: GPIODrive) => Promise<void>;
        openDrain: (openDrain: boolean) => Promise<void>;
        debounce: (debounce: boolean) => Promise<void>;
    };
    values: {
        mode: { label: string; value: GPIOMode }[];
        state?: { label: string; value: GPIOState }[];
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

export type BatteryModule = {
    get: {
        all: () => void;
        batteryInput: () => void;
        powerid: () => void;
    };
    callbacks: (() => void)[];
};

export type LowPowerModule = {
    get: {
        all: () => void;
        timeToActive: () => void;
    };
    set: {
        all(lowPower: LowPowerConfig): Promise<void>;
        timeToActive(timeToActive: TimeToActive): Promise<void>;
        powerButtonEnable?(powerButtonEnable: boolean): Promise<void>;
    };
    actions: {
        enterShipMode?(): void;
        enterShipHibernateMode?(): void;
        enterHibernatePtMode?(): void;
        enterBreakToWake?(): Promise<void>;
    };
    values: {
        timeToActive: { label: string; value: TimeToActive }[];
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
    };
    actions: {
        powerCycle?: () => Promise<void>;
    };
    values: {
        pinSelection: DropdownItem<ResetPinSelection>[];
        longPressReset: DropdownItem<LongPressReset>[];
        longPressResetDebounce: DropdownItem<LongPressResetDebounce>[];
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
    cancelLabel?: string;
    cancelDisabled?: boolean;
    cancelClosesDialog?: boolean;
    title: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void | Promise<void>;
    onOptional?: () => void | Promise<void>;
    doNotAskAgainStoreID?: string;
    progress?: number;
}

export const zodSchemaNpmMode = z.union([
    z.literal('npm1300'),
    z.literal('npm1304'),
    z.literal('npm2100'),
]);
export type NpmModel = z.infer<typeof zodSchemaNpmMode>;

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
    bucks?: BuckExport[];
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

export type IBatteryProfiler = {
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
