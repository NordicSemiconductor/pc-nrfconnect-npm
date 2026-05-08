/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable max-classes-per-file */

import {
    type DropdownItem,
    type Range,
    type ShellParser,
} from '@nordicsemiconductor/pc-nrfconnect-shared';
import { z } from 'zod';

import { type RangeOrNumberArray } from '../../../utils/helpers';
import type BaseNpmDevice from './basePmicDevice';
import type {
    BuckAlternateVOutControl1012,
    BuckModeControl1012,
    BuckOnOffControl1012,
    BuckVOutRippleControl1012,
} from './npm1012/buck/types';
import {
    type ITerm1012,
    type ITrickle1012,
    type VTrickleFast1012,
} from './npm1012/charger/types';
import type {
    GPIODrive as GPIOLEDDrvGPIODrive1012,
    GPIOModeInput as GPIOLEDDrvGPIOModeInput1012,
    GPIOModeOutput as GPIOLEDDrvGPIOModeOutput1012,
    GPIOPolarity as GPIOLEDDrvGPIOPolarity1012,
    GPIOPull as GPIOLEDDrvGPIOPull1012,
    LEDDrive as GPIOLEDDrvLEDDrive1012,
    LEDMode as GPIOLEDDrvLEDMode1012,
} from './npm1012/gpioleddrv/types';
import type { OnOffControl as LdoOnOffControl1012 } from './npm1012/ldo/types';
import type { TimeToActive as TimeToActive1012 } from './npm1012/lowPower/types';
import type {
    LongPressResetDebounce as LongPressResetDebounce1012,
    LongPressResetPinSel as LongPressResetPinSel1012,
    PowerDownWait as PowerDownWait1012,
} from './npm1012/reset/types';
import type { Mode as TimerMode1012 } from './npm1012/timerConfig/types';
import {
    type ITermNpm1300,
    type VTrickleFast1300,
} from './npm1300/charger/types';
import type {
    GPIODrive1300,
    GPIOMode1300,
    GPIOPull1300,
} from './npm1300/gpio/types';
import type { SoftStartCurrent as LdoSoftStartCurrent1300 } from './npm1300/ldo/types';
import type { Mode as LEDMode1300 } from './npm1300/led/types';
import type { TimeToActive as TimeToActive1300 } from './npm1300/lowPower/types';
import type { LongPressResetPinSel as LongPressResetPinSel1300 } from './npm1300/reset/types';
import { type npm1300TimerMode } from './npm1300/timerConfig/types';
import { type ITermNpm1304 } from './npm1304/charger/types';
import type { PowerID2100 } from './npm2100/battery';
import type {
    GPIODrive2100,
    GPIOMode2100,
    GPIOPull2100,
    GPIOState2100,
} from './npm2100/gpio/types';
import { type TimeToActive as TimeToActive2100 } from './npm2100/lowPower/types';
import {
    type nPM2100GPIOControlMode,
    type nPM2100GPIOControlPinSelect,
    type nPM2100LdoModeControl,
    type npm2100LongPressResetDebounce as LongPressResetDebounce2100,
    type npm2100ResetPinSelection as LongPressResetPinSel2100,
    type npm2100ResetReason as ResetReason2100,
    type npm2100TimerMode,
    type SoftStartCurrentLDOMode as LdoSoftStartCurrentLDOMode2100,
    type SoftStartCurrentLoadSwitchMode as LdoSoftStartCurrentLoadSwitchMode2100,
} from './npm2100/types';
import { type NpmEventEmitter } from './pmicHelpers';

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

export const VSETValues = ['VSET1', 'VSET2'] as const;

export const BuckModeControlValues = ['Auto', 'PWM', 'PFM'] as const;
export const BuckOnOffControlValues = ['Off'] as const;
export const BuckRetentionControlValues = ['Off'] as const;

type GPIONames = (typeof GPIOValues)[number];
export type RebootMode = 'cold' | 'warm';
export const LdoModeValues = ['Load_switch', 'LDO'] as const;
export type LdoMode = (typeof LdoModeValues)[number];
export type LdoSoftStartCurrent =
    | LdoSoftStartCurrent1300
    | LdoSoftStartCurrentLDOMode2100
    | LdoSoftStartCurrentLoadSwitchMode2100
    | number;
export type LdoGPIOControlPinSelect = nPM2100GPIOControlPinSelect;
export type LdoGPIOControlMode = nPM2100GPIOControlMode;
export type LdoModeControl = nPM2100LdoModeControl;
export type LdoOnOffControl =
    | (typeof LdoOnOffControlValues)[number]
    | GPIONames
    | LdoOnOffControl1012;

export const LdoVOutSelValues = ['Software', 'Vset'] as const;
export type LdoVOutSel = (typeof LdoVOutSelValues)[number];

export const BoostVOutSelValues = ['Vset', 'Software'] as const;
export type BoostVOutSel = (typeof BoostVOutSelValues)[number];
export type BoostModeControl = (typeof BoostModeControlValues)[number];
export type BoostPinMode = (typeof BoostPinModeValues)[number];
export type BoostPinSelection = (typeof BoostPinSelectionValues)[number];

export type BuckMode = 'vSet' | 'software';
export type BuckModeControl =
    | (typeof BuckModeControlValues)[number]
    | GPIONames
    | BuckModeControl1012;
export type BuckOnOffControl =
    | (typeof BuckOnOffControlValues)[number]
    | GPIONames
    | (typeof VSETValues)[number]
    | BuckOnOffControl1012;
export type BuckRetentionControl =
    | (typeof BuckRetentionControlValues)[number]
    | GPIONames;
export type BuckAlternateVOutControl = BuckAlternateVOutControl1012;
export type BuckVOutRippleControl = BuckVOutRippleControl1012;

export type ITerm = ITerm1012 | ITermNpm1300 | ITermNpm1304;
export type ITrickle = ITrickle1012;

export const NTCValues = ['Ignore NTC', '10 kΩ', '47 kΩ', '100 kΩ'] as const;
export type VTrickleFast = VTrickleFast1012 | VTrickleFast1300;
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
    | 'Ready'
    | 'NOT VSYS';

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

    activeBatterModel?: BatteryModel;
    actualCapacity?: number;
    batteryHealthEnabled?: boolean;
    batteryReplacementDetection?: boolean;
    chargingSamplingRate?: number;
    cycleCount?: number;
    discardPosiiveDeltaZ?: boolean;
    quickConvergenceMode?: boolean;
    ratedMinBatteryCapacity?: number;
};

export type Charger = {
    vTerm: number;
    vTrickleFast: VTrickleFast;
    iChg: number;
    enabled: boolean;
    enableRecharging: boolean;
    enableVBatLow: boolean;
    iTerm: ITerm;
    jeitaILabelCold: ChargerJeitaILabel;
    jeitaILabelCool: ChargerJeitaILabel;
    jeitaILabelNominal: ChargerJeitaILabel;
    jeitaILabelWarm: ChargerJeitaILabel;
    jeitaILabelHot: ChargerJeitaILabel;
    jeitaVLabelCold: ChargerJeitaVLabel;
    jeitaVLabelCool: ChargerJeitaVLabel;
    jeitaVLabelNominal: ChargerJeitaVLabel;
    jeitaVLabelWarm: ChargerJeitaVLabel;
    jeitaVLabelHot: ChargerJeitaVLabel;
    tChgResume: number;
    tCold: number;
    tCool: number;
    tWarm: number;
    tHot: number;

    enableAdvancedChargingProfile?: boolean;
    enableBatteryDischargeCurrentLimit?: boolean;
    enableChargeCurrentThrottling?: boolean;
    enableNtcMonitoring?: boolean;
    enableWeakBatteryCharging?: boolean;
    iBatLim?: number;
    iChgCool?: number;
    iChgWarm?: number;
    iThrottle?: number;
    iTrickle?: ITrickle;
    ntcBeta?: number;
    ntcThermistor?: NTCThermistor;
    tChgReduce?: number;
    tChgStop?: number;
    tOutCharge?: number;
    tOutTrickle?: number;
    vBatLow?: number;
    vTermCool?: number;
    vTermR?: number;
    vTermWarm?: number;
    vThrottle?: number;
    vWeak?: number;
};

export type OnBoardLoad = {
    iLoad: number;
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
    mode: BuckMode;
    modeControl: BuckModeControl;
    onOffControl: BuckOnOffControl;
    onOffSoftwareControlEnabled: boolean;
    enabled: boolean;
    cardLabel: string;
    vSetLabel: string;

    activeDischarge?: boolean;
    activeDischargeResistance?: number;
    alternateVOut?: number;
    alternateVOutControl?: BuckAlternateVOutControl;
    automaticPassthrough?: boolean;
    enabledWhenProfiling?: boolean;
    peakCurrentLimit?: number;
    quickVOutDischarge?: boolean;
    retentionControl?: BuckRetentionControl;
    shortCircuitProtection?: boolean;
    softStartPeakCurrentLimit?: number;
    vOutComparatorBiasCurrentLPMode?: number;
    vOutComparatorBiasCurrentULPMode?: number;
    vOutRetention?: number;
    vOutRippleControl?: BuckVOutRippleControl;
};

export type Ldo = {
    activeDischarge: boolean;
    cardLabel: string;
    enabled: boolean;
    onOffControl: LdoOnOffControl;
    onOffSoftwareControlEnabled: boolean;

    enabledWhenProfiling?: boolean;
    halt?: boolean;
    mode?: LdoMode;
    modeControl?: LdoModeControl;
    overcurrentProtection?: boolean;
    pinMode?: LdoGPIOControlMode;
    pinSel?: LdoGPIOControlPinSelect;
    ramp?: boolean;
    softStart?: boolean;
    softStartCurrent?: LdoSoftStartCurrent;
    softStartCurrentDropdownDisabled?: boolean;
    softStartCurrentLDOMode?: LdoSoftStartCurrent;
    softStartCurrentLoadSwitchMode?: LdoSoftStartCurrent;
    softStartTime?: number;
    vOutSel?: LdoVOutSel;
    voltage?: number;
    weakPullDown?: boolean;
};

export type GPIOState = GPIOState2100;
export type GPIOMode = GPIOMode1300 | GPIOMode2100;
export type GPIOPull = GPIOPull1300 | GPIOPull2100;
export type GPIODrive = GPIODrive1300 | GPIODrive2100;

export type GPIO = {
    mode: GPIOMode;
    state?: GPIOState;
    stateShown?: boolean;
    pull: GPIOPull;
    pullEnabled: boolean;
    drive: GPIODrive;
    driveEnabled: boolean;
    openDrain: boolean;
    openDrainEnabled: boolean;
    debounce: boolean;
    debounceEnabled: boolean;
};

export type LEDMode = LEDMode1300;

export type LED = {
    cardLabel: string;

    blinkContinuous?: boolean;
    blinkDouble?: boolean;
    blinkTimeOff?: number;
    blinkTimeOn?: number;
    mode?: LEDMode;
    pwmFrequency?: number;
    rgbPhaseShifting?: boolean;
};

export const GPIOLEDDrvStateValues = ['GPIO', 'LED'] as const;
export type GPIOLEDDrvState = (typeof GPIOLEDDrvStateValues)[number];

export const GPIOLEDDrvGPIOStateValues = ['Input', 'Output'] as const;
export type GPIOLEDDrvGPIOState = (typeof GPIOLEDDrvGPIOStateValues)[number];

export type GPIOLEDDrvGPIODrive = GPIOLEDDrvGPIODrive1012;
export type GPIOLEDDrvGPIOMode =
    | GPIOLEDDrvGPIOModeInput1012
    | GPIOLEDDrvGPIOModeOutput1012;
export type GPIOLEDDrvGPIOPolarity = GPIOLEDDrvGPIOPolarity1012;
export type GPIOLEDDrvGPIOPull = GPIOLEDDrvGPIOPull1012;

export type GPIOLEDDrvLEDDrive = GPIOLEDDrvLEDDrive1012;
export type GPIOLEDDrvLEDMode = GPIOLEDDrvLEDMode1012;

export type GPIOLEDDrv = {
    gpioDebounce: boolean;
    gpioDrive: GPIOLEDDrvGPIODrive;
    gpioDutyCycle: number;
    gpioMode: GPIOLEDDrvGPIOMode;
    gpioOpenDrain: boolean;
    gpioPolarity: GPIOLEDDrvGPIOPolarity;
    gpioPull: GPIOLEDDrvGPIOPull;
    gpioState: GPIOLEDDrvGPIOState;

    ledDrive: GPIOLEDDrvLEDDrive;
    ledDutyCycle: number;
    ledMode: GPIOLEDDrvLEDMode;

    state: GPIOLEDDrvState;
};

export const POFPolarityValues = ['Active low', 'Active high'] as const;
export type POFPolarity = (typeof POFPolarityValues)[number];

export type POF = {
    enable: boolean;
    polarity: POFPolarity;
    threshold: number;
};

export type TimerMode = TimerMode1012 | npm1300TimerMode | npm2100TimerMode;

export const TimerPrescalerValues = ['Slow', 'Fast'] as const;
export type TimerPrescaler = (typeof TimerPrescalerValues)[number];

export type TimerConfig = {
    mode: TimerMode;
    period: number;

    enabled?: boolean;
    prescaler?: TimerPrescaler;
};

export enum ChargerJeitaILabel {
    coldIOff,

    coolIChgCool,
    coolIChg50percent,
    coolICool,

    nominalIChg,

    warmIChg,
    warmIChgWarm,

    hotIOff,
}

export enum ChargerJeitaVLabel {
    coldVNA,

    coolVTerm,
    coolVTermCool,

    nominalVTerm,

    warmVTermR,
    warmVTermWarm,
    warmVTerm100mVOff,

    hotVNA,
}

export type TimeToActive =
    | TimeToActive1012
    | TimeToActive1300
    | TimeToActive2100;

export type OperatingMode =
    | 'active'
    | 'ship'
    | 'vbatHibernate'
    | 'vbusHibernate'
    | 'vbusStandby1'
    | 'vbusStandby2';

export type LowPowerConfig = {
    timeToActive: TimeToActive;

    hibernateWakeupByButton?: boolean;
    invPolarity?: boolean;
    operatingMode?: OperatingMode;
    powerButtonEnable?: boolean;
    vbusHibernateWait?: boolean;
    vbusHibernateWaitingForChargeComplete?: boolean;
    vbusStandbyWait?: boolean;
    vbusStandbyWaitingForChargeComplete?: boolean;
};

export type ResetConfig = {
    longPressResetPinSel: LongPressResetPinSel;

    longPressResetDebounce?: LongPressResetDebounce;
    longPressResetEnable?: boolean;
    powerDownWait?: PowerDownWait;
    resetReason?: ResetReason;
};

export type LongPressResetPinSel =
    | LongPressResetPinSel1012
    | LongPressResetPinSel1300
    | LongPressResetPinSel2100;

export type LongPressResetDebounce =
    | LongPressResetDebounce1012
    | LongPressResetDebounce2100;

export type PowerDownWait = PowerDownWait1012;

export type ResetReason = ResetReason2100;

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
export interface BatteryHealthProfileLoadUpdate {
    alertMessage?: string;
    state: 'downloading' | 'aborted' | 'aborting' | 'applied' | 'failed';
}

export type FixedListRange = number[] | FixedListRangeWithLabel;
export type FixedListRangeWithLabel = number[] & {
    toLabel: (value: number) => string;
};

export type RangeOrFixedListRange = Range | FixedListRange;

export const isFixedListRange = (
    range: RangeOrFixedListRange,
): range is FixedListRange => Array.isArray(range);

export const isFixedListRangeWithLabel = (
    range: RangeOrFixedListRange,
): range is FixedListRangeWithLabel =>
    Array.isArray(range) &&
    (range as FixedListRangeWithLabel).toLabel !== undefined;

export const isRangeType = (range: RangeOrFixedListRange): range is Range =>
    !Array.isArray(range);

export interface FuelGaugeModule {
    get: {
        all: () => void;
        enabled: () => void;
        activeBatteryModel: () => void;
        storedBatteryModel: () => void;

        batteryHealthAll?: () => void;
        batteryHealthEnabled?: () => void;
        batteryReplacementDetection?: () => void;
        discardPosiiveDeltaZ?: () => void;
        quickConvergenceMode?: () => void;
        ratedMinBatteryCapacity?: () => void;
    };
    set: {
        all: (config: FuelGaugeExport) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;
        activeBatteryModel: (name: string) => Promise<void>;

        adcSample?: (
            reportingRate: number,
            samplingInterval: number,
        ) => Promise<void>;
        batteryHealthEnabled?: (value: boolean) => Promise<void>;
        batteryReplacementDetection?: (value: boolean) => Promise<void>;
        batteryStatusCheckEnabled?: (enabled: boolean) => Promise<void>;
        discardPosiiveDeltaZ?: (value: boolean) => void;
        quickConvergenceMode?: (value: boolean) => Promise<void>;
        ratedMinBatteryCapacity?: (value: number) => Promise<void>;
    };
    actions: {
        abortDownloadFuelGaugeProfile: () => Promise<void>;
        applyDownloadFuelGaugeProfile: (slot?: number) => Promise<void>;
        downloadFuelGaugeProfile: (
            profile: Buffer,
            slot?: number,
        ) => Promise<void>;
        reset: () => Promise<void>;

        abortLoadBatteryHealthProfile?: () => Promise<void>;
        loadBatteryHealthProfile?: (
            profile: Buffer,
            batteryModelName: string,
            slot?: number,
        ) => Promise<void>;
        resetBatteryHealthData?: () => Promise<void>;
    };
    ranges: {
        ratedMinBatteryCapacity?: Range;
        samplingInterval?: Range;
    };
    callbacks: (() => void)[];
    defaults: FuelGauge;
}

export type ModuleParams = {
    index: number;
    shellParser: ShellParser | undefined;
    eventEmitter: NpmEventEmitter;
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void,
    ) => void;
    dialogHandler: ((dialog: PmicDialog) => void) | null;
    offlineMode: boolean;
    npmDevice: BaseNpmDevice;
    pmicRevision: number | undefined;
};

export interface IModule<T> {
    new (params: ModuleParams): T;
}

export type ChargerModuleSet = new (
    eventEmitter: NpmEventEmitter,
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void,
    ) => void,
    offlineMode: boolean,
    get: ChargerModuleGetBase,
) => ChargerModuleSetBase;

export abstract class ChargerModuleSetBase {
    constructor(
        protected eventEmitter: NpmEventEmitter,
        protected sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
        protected offlineMode: boolean,
        protected get: ChargerModuleGetBase,
    ) {}

    abstract all(charger: Charger): Promise<void>;
    abstract vTerm(value: number): Promise<void>;
    abstract iChg(value: number): Promise<void>;
    abstract enabled(value: boolean): Promise<void>;
    abstract vTrickleFast(value: VTrickleFast): Promise<void>;
    abstract iTerm(iTerm: ITerm): Promise<void>;
    abstract enabledRecharging(value: boolean): Promise<void>;
    abstract enabledVBatLow(value: boolean): Promise<void>;
    abstract tChgResume(value: number): Promise<void>;
    abstract tCold(value: number): Promise<void>;
    abstract tCool(value: number): Promise<void>;
    abstract tWarm(value: number): Promise<void>;
    abstract tHot(value: number): Promise<void>;

    batLim?(value: number): Promise<void>;
    enableAdvancedChargingProfile?(value: boolean): Promise<void>;
    enableBatteryDischargeCurrentLimit?(value: boolean): Promise<void>;
    enableChargeCurrentThrottling?(value: boolean): Promise<void>;
    enableNtcMonitoring?(value: boolean): Promise<void>;
    enabledWeakBatteryCharging?(value: boolean): Promise<void>;
    enabledWeakBatteryCharging?(value: boolean): Promise<void>;
    iChgCool?(value: number): Promise<void>;
    iChgWarm?(value: number): Promise<void>;
    iThrottle?(value: number): Promise<void>;
    iTrickle?(value: ITrickle): Promise<void>;
    iTrickle?(value: ITrickle): Promise<void>;
    nTCBeta?(value: number): Promise<void>;
    nTCThermistor?(mode: NTCThermistor, autoSetBeta?: boolean): Promise<void>;
    tChgReduce?(value: number): Promise<void>;
    tChgStop?(value: number): Promise<void>;
    tOutCharge?(value: number): Promise<void>;
    tOutTrickle?(value: number): Promise<void>;
    vBatLow?(value: number): Promise<void>;
    vTermCool?(value: number): Promise<void>;
    vTermR?(value: number): Promise<void>;
    vTermWarm?(value: number): Promise<void>;
    vThrottle?(value: number): Promise<void>;
    vWeak?(value: number): Promise<void>;
}

export type ChargerModuleGet = new (
    sendCommand: (
        command: string,
        onSuccess?: (response: string, command: string) => void,
        onError?: (response: string, command: string) => void,
    ) => void,
) => ChargerModuleGetBase;

export abstract class ChargerModuleGetBase {
    constructor(
        protected sendCommand: (
            command: string,
            onSuccess?: (response: string, command: string) => void,
            onError?: (response: string, command: string) => void,
        ) => void,
    ) {}

    abstract all(): void;
    abstract state(): void;
    abstract vTerm(): void;
    abstract iChg(): void;
    abstract enabled(): void;
    abstract vTrickleFast(): void;
    abstract iTerm(): void;
    abstract enabledRecharging(): void;
    abstract enabledVBatLow(): void;
    abstract tChgResume(): void;
    abstract tCold(): void;
    abstract tCool(): void;
    abstract tWarm(): void;
    abstract tHot(): void;

    batLim?(): void;
    enabledAdvancedChargingProfile?(): void;
    enabledBatteryDischargeCurrentLimit?(): void;
    enabledChargeCurrentThrottling?(): void;
    enabledNtcMonitoring?(): void;
    enabledWeakBatteryCharging?(): void;
    enabledWeakBatteryCharging?(): void;
    iChgCool?(): void;
    iChgWarm?(): void;
    iThrottle?(): void;
    iTrickle?(): void;
    iTrickle?(): void;
    nTCBeta?(): void;
    nTCThermistor?(): void;
    tChgReduce?(): void;
    tChgStop?(): void;
    tOutCharge?(): void;
    tOutTrickle?(): void;
    vBatLow?(): void;
    vTermCool?(): void;
    vTermR?(): void;
    vTermWarm?(): void;
    vThrottle?(): void;
    vWeak?(): void;
}

export type ChargerModuleRanges = {
    voltage: number[];
    jeita: Range;
    chipThermal: Range;
    current: RangeOrNumberArray;
    nTCBeta: Range;
    vLowerCutOff: Range;
    batterySize: Range;

    iBatLim?: FixedListRange;
    vTermR?: number[];
    vWeak?: Range;
};

export type ChargerModuleValues = {
    iTerm: { label: string; value: ITerm }[];
    vTrickleFast: { label: string; value: VTrickleFast }[];

    iThrottle?: { label: string; value: number }[];
    iTrickle?: { label: string; value: ITrickle }[];
    tOutCharge?: { label: string; value: number }[];
    tOutTrickle?: { label: string; value: number }[];
    vBatLow?: { label: string; value: number }[];
    vThrottle?: { label: string; value: number }[];
};

export interface ChargerModule {
    get: ChargerModuleGetBase;
    set: ChargerModuleSetBase;
    callbacks: (() => void)[];
    ranges: ChargerModuleRanges;
    defaults: Charger;
    values: ChargerModuleValues;
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
        voltage: Range;
    };
    defaults: Boost;
}

export interface BuckModule {
    index: number;
    get: {
        all: () => void;
        vOutNormal: () => void;
        mode: () => void;
        enabled: () => void;
        modeControl: () => void;
        onOffControl: () => void;

        activeDischarge?: () => void;
        activeDischargeResistance?: () => void;
        alternateVOutControl?: () => void;
        automaticPassthrough?: () => void;
        peakCurrentLimit?: () => void;
        quickVOutDischarge?: () => void;
        retentionControl?: () => void;
        shortCircuitProtection?: () => void;
        softStartPeakCurrentLimit?: () => void;
        alternateVOut?: () => void;
        vOutComparatorBiasCurrent?: (mode: BuckModeControl) => void;
        vOutRetention?: () => void;
        vOutRippleControl?: () => void;
    };
    set: {
        all: (config: BuckExport) => Promise<void>;
        vOutNormal: (value: number) => Promise<void>;
        mode: (mode: BuckMode) => Promise<void>;
        modeControl: (modeControl: BuckModeControl) => Promise<void>;
        onOffControl: (onOffControl: BuckOnOffControl) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;

        activeDischarge?: (activeDischarge: boolean) => Promise<void>;
        activeDischargeResistance?: (value: number) => Promise<void>;
        alternateVOut?: (value: number) => Promise<void>;
        alternateVOutControl?: (
            value: BuckAlternateVOutControl,
        ) => Promise<void>;
        automaticPassthrough?: (value: boolean) => Promise<void>;
        peakCurrentLimit?: (value: number) => Promise<void>;
        quickVOutDischarge?: (value: boolean) => Promise<void>;
        shortCircuitProtection?: (value: boolean) => Promise<void>;
        softStartPeakCurrentLimit?: (value: number) => Promise<void>;
        retentionControl?: (
            retentionControl: BuckRetentionControl,
        ) => Promise<void>;
        vOutComparatorBiasCurrent?: (
            mode: BuckModeControl,
            value: number,
        ) => Promise<void>;
        vOutRetention?: (value: number) => Promise<void>;
        vOutRippleControl?: (value: BuckVOutRippleControl) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage: Range;

        alternateVOut?: Range;
        retVOut?: Range;
    };
    values: {
        activeDischargeResistance?: { label: string; value: number }[];
        alternateVOutControl?: {
            label: string;
            value: BuckAlternateVOutControl;
        }[];
        modeControl: { label: string; value: BuckModeControl }[];
        onOffControl: (
            mode: BuckMode,
        ) => { label: string; value: BuckOnOffControl }[];
        peakCurrentLimit?: { label: string; value: number }[];
        retentionControl?: { label: string; value: BuckRetentionControl }[];
        softStartPeakCurrentLimit?: { label: string; value: number }[];
        vOutComparatorBiasCurrent?: (
            mode: BuckModeControl,
        ) => { label: string; value: number }[];
        vOutRippleControl?: { label: string; value: BuckVOutRippleControl }[];
    };
    defaults: Buck;
}

export interface LdoModule {
    index: number;
    get: {
        all: () => void;
        enabled: () => void;

        activeDischarge?: () => void;
        halt?: () => void;
        mode?: () => void;
        modeControl?: () => void;
        onOffControl?: () => void;
        overcurrentProtection?: () => void;
        pinMode?: () => void;
        pinSel?: () => void;
        ramp?: () => void;
        softStart?: () => void;
        softStartCurrent?: (mode?: LdoMode) => void;
        softStartTime?: () => void;
        vOutSel?: () => void;
        voltage?: () => void;
        weakPullDown?: () => void;
    };
    set: {
        all: (config: LdoExport) => Promise<void>;
        enabled: (enabled: boolean) => Promise<void>;

        activeDischarge?: (activeDischarge: boolean) => Promise<void>;
        halt?: (halt: boolean) => Promise<void>;
        mode?: (mode: LdoMode) => Promise<void>;
        modeControl?: (modeCtrl: LdoModeControl) => Promise<void>;
        onOffControl?: (onOffControl: LdoOnOffControl) => Promise<void>;
        overcurrentProtection?: (ocp: boolean) => Promise<void>;
        pinMode?: (pinMode: LdoGPIOControlMode) => Promise<void>;
        pinSel?: (pinSel: LdoGPIOControlPinSelect) => Promise<void>;
        ramp?: (ramp: boolean) => Promise<void>;
        softStart?: (enabled: boolean) => Promise<void>;
        softStartCurrent?: (
            value: LdoSoftStartCurrent,
            mode?: LdoMode,
        ) => Promise<void>;
        softStartTime?: (value: number) => Promise<void>;
        vOutSel?: (mode: LdoVOutSel) => Promise<void>;
        voltage?: (value: number) => Promise<void>;
        weakPullDown?: (enable: boolean) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        voltage?: Range;
    };
    values: {
        modeControl?: { label: string; value: LdoModeControl }[];
        onOffControl?: (
            mode?: LdoMode,
            vOutSel?: LdoVOutSel,
        ) => { label: string; value: LdoOnOffControl }[];
        pinMode?: { label: string; value: LdoGPIOControlMode }[];
        pinSel?: { label: string; value: LdoGPIOControlPinSelect }[];
        softStartCurrent?: (mode?: LdoMode) => {
            label: string;
            value: LdoSoftStartCurrent;
        }[];
        softStartTime?: { label: string; value: number }[];
    };
    defaults: Ldo;
}

export interface OnBoardLoadModule {
    get: {
        all: () => void;
        iLoad: () => void;
    };
    set: {
        all: (onBoardLoad: OnBoardLoad) => Promise<void>;
        iLoad: (value: number) => Promise<void>;
    };
    callbacks: (() => void)[];
    ranges: {
        iLoad: Range;
    };
    defaults: OnBoardLoad;
}

export interface GpioLedDrvModule {
    defaults: GPIOLEDDrv;
    index: number;

    callbacks: (() => void)[];
    get: {
        all: () => void;

        gpioDebounce: () => void;
        gpioDrive: () => void;
        gpioDutyCycle: () => void;
        gpioMode: () => void;
        gpioOpenDrain: () => void;
        gpioPolarity: () => void;
        gpioPull: () => void;
        gpioState: () => void;

        ledDrive: () => void;
        ledDutyCycle: () => void;
        ledMode: () => void;

        state: () => void;
    };
    ranges: {
        gpioDutyCycle: Range;

        ledDutyCycle: Range;
    };
    set: {
        all: (value: GPIOLEDDrv) => Promise<void>;

        gpioDebounce: (value: boolean) => Promise<void>;
        gpioDrive: (value: GPIOLEDDrvGPIODrive) => Promise<void>;
        gpioDutyCycle: (value: number) => Promise<void>;
        gpioMode: (
            mode: GPIOLEDDrvGPIOMode,
            state: GPIOLEDDrvGPIOState,
        ) => Promise<void>;
        gpioOpenDrain: (value: boolean) => Promise<void>;
        gpioPolarity: (value: GPIOLEDDrvGPIOPolarity) => Promise<void>;
        gpioPull: (value: GPIOLEDDrvGPIOPull) => Promise<void>;
        gpioState: (value: GPIOLEDDrvGPIOState) => Promise<void>;

        ledDrive: (value: GPIOLEDDrvLEDDrive) => Promise<void>;
        ledDutyCycle: (value: number) => Promise<void>;
        ledMode: (value: GPIOLEDDrvLEDMode) => Promise<void>;

        state: (value: GPIOLEDDrvState) => Promise<void>;
    };
    values: {
        gpioDrive: { label: string; value: GPIOLEDDrvGPIODrive }[];
        gpioMode: (
            state: GPIOLEDDrvGPIOState,
        ) => { label: string; value: GPIOLEDDrvGPIOMode }[];
        gpioPolarity: { label: string; value: GPIOLEDDrvGPIOPolarity }[];
        gpioPull: { label: string; value: GPIOLEDDrvGPIOPull }[];

        ledDrive: { label: string; value: GPIOLEDDrvLEDDrive }[];
        ledMode: { label: string; value: GPIOLEDDrvLEDMode }[];
    };
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

export interface LedModule {
    defaults: LED;
    index: number;

    actions: {
        blink?: () => void;
    };
    callbacks: (() => void)[];
    get: {
        all: () => void;

        blinkContinuous?: () => void;
        blinkDouble?: () => void;
        blinkTimeOff?: () => void;
        blinkTimeOn?: () => void;
        mode?: () => void;
        pwmFrequency?: () => void;
        rgbPhaseShifting?: () => void;
    };
    ranges: {
        blinkTime?: Range;
    };
    set: {
        all: (config: LedExport) => Promise<void>;

        blinkContinuous?: (value: boolean) => Promise<void>;
        blinkDouble?: (value: boolean) => Promise<void>;
        blinkTimeOff?: (value: number) => Promise<void>;
        blinkTimeOn?: (value: number) => Promise<void>;
        mode?: (mode: LEDMode) => Promise<void>;
        pwmFrequency?: (freq: number) => Promise<void>;
        rgbPhaseShifting?: (value: boolean) => Promise<void>;
    };
    values: {
        mode?: { label: string; value: LEDMode }[];
        pwmFrequency?: { label: string; value: number }[];
    };
}

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
        threshold: Range;
    };
    defaults: POF;
}

export type TimerConfigModule = {
    get: {
        all: () => void;
        mode: () => void;
        period: () => void;

        enabled?: () => void;
        prescaler?: () => void;
    };
    set: {
        all(timerConfig: TimerConfig): Promise<void>;
        mode(mode: TimerMode): Promise<void>;
        period(period: number): Promise<void>;

        enabled?(enabled: boolean): Promise<void>;
        prescaler?(prescaler: TimerPrescaler): Promise<void>;
    };
    values: {
        mode: { label: string; value: TimerMode }[];
    };
    callbacks: (() => void)[];
    ranges: {
        periodRange: (prescalerMultiplier: number) => Range;
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
    actions: {
        enterBreakToWake?: () => void;
        enterHibernatePtMode?: () => void;
        enterShipHibernateMode?: () => Promise<void>;
        enterShipMode?: () => Promise<void>;
        enterVbusHibernateMode?: (
            waitForChargeComplete?: boolean,
        ) => Promise<void>;
        enterVbusStandby1Mode?: (
            waitForChargeComplete?: boolean,
        ) => Promise<void>;
        enterVbusStandby2Mode?: (
            waitForChargeComplete?: boolean,
        ) => Promise<void>;
        exitVbusStandby1Mode?: () => Promise<void>;
        exitVbusStandby2Mode?: () => Promise<void>;
    };
    get: {
        all: () => void;
        timeToActive: () => void;

        hibernateWakeupByButton?: () => void;
        vbusHibernateWait?: () => void;
        vbusStandbyWait?: () => void;
        vbusStatus?: () => void;
    };
    set: {
        all: (lowPower: LowPowerConfig) => Promise<void>;
        timeToActive: (timeToActive: TimeToActive) => Promise<void>;

        hibernateWakeupByButton?: (value: boolean) => Promise<void>;
        powerButtonEnable?: (powerButtonEnable: boolean) => Promise<void>;
        vbusHibernateWait?: (value: boolean) => Promise<void>;
        vbusStandbyWait?: (value: boolean) => Promise<void>;
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
        longPressResetPinSel: () => void;

        longPressResetDebounce?: () => void;
        longPressResetEnable?: () => void;
        powerDownWait?: () => void;
        resetReason?: () => void;
    };
    set: {
        all: (reset: ResetConfig) => Promise<void>;
        longPressResetPinSel: (value: LongPressResetPinSel) => Promise<void>;

        longPressResetDebounce?: (
            value: LongPressResetDebounce,
        ) => Promise<void>;
        longPressResetEnable?: (value: boolean) => Promise<void>;
        powerDownWait?: (value: PowerDownWait) => Promise<void>;
    };
    actions: {
        powerCycle?: () => Promise<void>;
    };
    values: {
        longPressResetPinSel: DropdownItem<LongPressResetPinSel>[];

        longPressResetDebounce?: DropdownItem<LongPressResetDebounce>[];
        powerDownWait?: DropdownItem<PowerDownWait>[];
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
    z.literal('npm1012'),
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
export type LdoExport = Omit<Ldo, 'cardLabel' | 'onOffSoftwareControlEnabled'>;
export type BuckExport = Omit<
    Buck,
    'onOffSoftwareControlEnabled' | 'cardLabel' | 'vSetLabel'
>;
export type GPIOExport = Omit<
    GPIO,
    | 'pullEnabled'
    | 'driveEnabled'
    | 'openDrainEnabled'
    | 'debounceEnabled'
    | 'stateShown'
>;
export type GPIOLEDDrvExport = Omit<GPIOLEDDrv, ''>;
export type USBPowerExport = Omit<USBPower, 'detectStatus'>;
export type LedExport = Omit<LED, 'cardLabel'>;
export type LowPowerExport = Omit<
    LowPowerConfig,
    | 'operatingMode'
    | 'vbusHibernateWaitingForChargeComplete'
    | 'vbusStandbyWaitingForChargeComplete'
>;

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
    gpioLedDrvs?: GPIOLEDDrvExport[];
    leds?: LedExport[];
    pof?: POF;
    onBoardLoad?: OnBoardLoad;
    lowPower?: LowPowerExport;
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

export interface RestingCCProfile extends CCProfile {
    cycles: number;
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
    restingProfiles: RestingCCProfile[];
    profilingProfiles: CCProfile[];
    iTerm: ITerm;
}

export type BatteryProfiler = {
    release: () => void;
    setProfile: (
        reportIntervalCc: number,
        reportIntervalNtc: number,
        vCutoff: number,
        profiles: CCProfile[],
    ) => Promise<void>;
    canProfile: () => Promise<true | 'MissingSyncBoard' | 'ActiveLoadNotVSYS'>;
    startProfiling: () => Promise<void>;
    stopProfiling: () => Promise<void>;
    isProfiling: () => Promise<boolean>;
    getProfilingState: () => CCProfilingState;
    onProfilingStateChange: (
        handler: (state: CCProfilingState, error?: string) => void,
    ) => () => void;
    onProfilingEvent: (
        handler: (state: ProfilingEvent, error?: string) => void,
    ) => () => void;
    pofError: () => void;
    restingProfile(): RestingCCProfile[];
    loadProfile(
        capacity: number,
        vUpperCutOff: number,
        vLowerCutOff: number,
        vTerm: number,
    ): CCProfile[];
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

export type NpmPeripherals = {
    ChargerModule?: IModule<ChargerModule>;
    maxEnergyExtraction: boolean;
    noOfBatterySlots: number;
    ldos?: {
        Module: IModule<LdoModule>;
        count: number;
    };
    bucks?: {
        Module: IModule<BuckModule>;
        count: number;
    };
    gpios?: {
        Module: IModule<GpioModule>;
        count: number;
    };
    gpioLedDrvs?: {
        Module: IModule<GpioLedDrvModule>;
        count: number;
    };
    boosts?: {
        Module: IModule<BoostModule>;
        count: number;
    };
    leds?: {
        Module: IModule<LedModule>;
        count: number;
    };
    BatteryProfiler?: IModule<BatteryProfiler>;
    PofModule?: IModule<PofModule>;
    UsbCurrentLimiterModule?: IModule<UsbCurrentLimiterModule>;
    TimerConfigModule?: IModule<TimerConfigModule>;
    BatteryModule?: IModule<BatteryModule>;
    LowPowerModule?: IModule<LowPowerModule>;
    ResetModule?: IModule<ResetModule>;
    FuelGaugeModule?: IModule<FuelGaugeModule>;
    OnBoardLoadModule?: IModule<OnBoardLoadModule>;
};
