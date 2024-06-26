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
    nPM2100LDOSoftStart as Npm2100LDOSoftStart,
    nPM2100LDOSoftStart,
    nPM2100LoadSwitchSoftStart as Npm2100LoadSwitchSoftStart,
    nPM2100LoadSwitchSoftStart,
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
export const LdoModeValues = ['load_switch', 'LDO'] as const;
export type LdoMode = (typeof LdoModeValues)[number];
export const SoftStartValues = [10, 20, 35, 50, undefined] as const;
export type Npm1300LoadSwitchSoftStart = (typeof SoftStartValues)[number];
export type LdoOnOffControl =
    | (typeof LdoOnOffControlValues)[number]
    | GPIONames;

export const BoostModeValues = ['VSET', 'SOFTWARE'] as const;
export type BoostMode = (typeof BoostModeValues)[number];
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
    vOut: number;
    mode: BoostMode;
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
    ldoRampEnabled?: boolean;
    ldoHaltEnabled?: boolean;
    softStartEnabled: boolean;
    softStart?: Npm1300LoadSwitchSoftStart;
    loadSwitchSoftStart?: Npm2100LoadSwitchSoftStart;
    ldoSoftStart?: Npm2100LDOSoftStart;
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

export const TimerModeValues = [
    'Boot monitor',
    'Watchdog warning',
    'Watchdog reset',
    'General purpose',
    'Wakeup',
] as const;
export type TimerMode = (typeof TimerModeValues)[number];

export const TimerPrescalerValues = ['Slow', 'Fast'] as const;
export type TimerPrescaler = (typeof TimerPrescalerValues)[number];

export type TimerConfig = {
    mode: TimerMode;
    prescaler: TimerPrescaler;
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

export type ShipModeConfig = {
    timeToActive: TimeToActive;
    invPolarity: boolean;
    longPressReset: LongPressReset;
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
        vOut: () => void;
        mode: () => void;
        modeControl: () => void;
        pinSelection: () => void;
        pinMode: () => void;
        overCurrent: () => void;
    };
    set: {
        all: (config: Boost) => Promise<void>;
        vOut: (value: number) => Promise<void>;
        mode: (mode: BoostMode) => Promise<void>;
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
        prescaler: () => void;
        period: () => void;
    };
    set: {
        all(timerConfig: TimerConfig): Promise<void>;
        mode(mode: TimerMode): Promise<void>;
        prescaler(prescaler: TimerPrescaler): Promise<void>;
        period(period: number): Promise<void>;
    };
    callbacks: (() => void)[];
    defaults: TimerConfig;
};

export type ShipModeModule = {
    get: {
        all: () => void;
        timeToActive: () => void;
        longPressReset: () => void;
    };
    set: {
        all(shipMode: ShipModeConfig): Promise<void>;
        timeToActive(timeToActive: TimeToActive): Promise<void>;

        longPressReset(longPressReset: LongPressReset): Promise<void>;
        enterShipMode(): void;
        enterShipHibernateMode(): void;
    };
    callbacks: (() => void)[];
    defaults: ShipModeConfig;
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
    onShipUpdate: (
        handler: (payload: Partial<ShipModeConfig>, error?: string) => void
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

    clearErrorLogs: (errorOnly?: boolean) => void;

    onFuelGaugeUpdate: (handler: (payload: boolean) => void) => () => void;

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

    hasMaxEnergyExtraction: () => boolean;
    getNumberOfLdos: () => number;
    getNumberOfLEDs: () => number;
    getNumberOfBatteryModelSlots: () => number;

    isSupportedVersion: () => Promise<{ supported: boolean; version: string }>;
    getSupportedVersion: () => string;
    getPmicVersion: () => Promise<number>;
    isPMICPowered: () => Promise<boolean>;

    getUptimeOverflowCounter: () => number;
    setUptimeOverflowCounter: (value: number) => void;
    release: () => void;

    chargerModule?: ChargerModule;
    gpioModule: GpioModule[];
    boostModule: BoostModule[];
    pofModule?: PofModule;
    shipModeModule?: ShipModeModule;
    timerConfigModule?: TimerConfigModule;
    buckModule: BuckModule[];
    usbCurrentLimiterModule?: UsbCurrentLimiterModule;
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

    getLdoVoltageRange: (index: number) => RangeType;

    ldoDefaults: () => Ldo[];
    ledDefaults: () => LED[];

    getBatteryConnectedVoltageThreshold: () => number;

    requestUpdate: {
        all: () => void;

        ldoVoltage: (index: number) => void;
        ldoEnabled: (index: number) => void;
        ldoMode: (index: number) => void;
        ldoSoftStartEnabled?: (index: number) => void;
        ldoSoftStart?: (index: number) => void;
        ldoActiveDischarge?: (index: number) => void;
        ldoOnOffControl?: (index: number) => void;

        ledMode: (index: number) => void;

        fuelGauge: () => void;

        activeBatteryModel: () => void;
        storedBatteryModel: () => void;
    };

    setLdoVoltage: (index: number, value: number) => Promise<void>;
    setLdoEnabled: (index: number, state: boolean) => Promise<void>;
    setLdoMode: (index: number, mode: LdoMode) => Promise<void>;
    setLdoSoftStartEnabled?: (index: number, enabled: boolean) => Promise<void>;

    // TODO: This is to be renamed as loadswitch softstart (1300 has no ldo soft start)
    setLdoSoftStart?: (
        index: number,
        softStart: Npm1300LoadSwitchSoftStart
    ) => Promise<void>;
    setLdoActiveDischarge?: (index: number, state: boolean) => Promise<void>;
    setLdoOnOffControl?: (
        index: number,
        mode: LdoOnOffControl
    ) => Promise<void>;

    setLdoModeControl?: (
        index: number,
        modeControl: nPM2100LdoModeControl
    ) => Promise<void>;
    setLdoPinSel?: (
        index: number,
        pinSel: nPM2100GPIOControlPinSelect
    ) => Promise<void>;

    // TODO: This should be kept after renaming the old ldoSoftStart -> loadSwitchSoftstart
    setLdoSoftstart?: (
        index: number,
        ldoSoftStart: nPM2100LDOSoftStart
    ) => Promise<void>;

    // TODO: This is the same as nPM1300 ldoSoftStart
    setLoadSwitchSoftstart?: (
        index: number,
        loadSwitchSoftStart: nPM2100LoadSwitchSoftStart
    ) => Promise<void>;
    setLdoPinMode?: (
        index: number,
        pinMode: nPM2100GPIOControlMode
    ) => Promise<void>;
    setLdoOcpEnabled?: (index: number, ocpEnabled: boolean) => Promise<void>;
    setLdoRampEnabled?: (index: number, rampEnabled: boolean) => Promise<void>;
    setLdoHaltEnabled?: (index: number, haltEnabled: boolean) => Promise<void>;

    setLedMode: (index: number, mode: LEDMode) => Promise<void>;

    setFuelGaugeEnabled: (state: boolean) => Promise<void>;
    downloadFuelGaugeProfile: (profile: Buffer, slot?: number) => Promise<void>;
    abortDownloadFuelGaugeProfile: () => Promise<void>;
    applyDownloadFuelGaugeProfile: (slot?: number) => Promise<void>;
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
    onConfirm: () => void | Promise<void>;
    onCancel: () => void | Promise<void>;
    onOptional?: () => void | Promise<void>;
    doNotAskAgainStoreID?: string;
    progress?: number;
}

export type NpmModel = 'npm1300' | 'npm2100';

export type LdoExport = Omit<Ldo, 'onOffSoftwareControlEnabled'>;
export type BuckExport = Omit<Buck, 'onOffSoftwareControlEnabled'>;
export type GPIOExport = Omit<
    GPIO,
    'pullEnabled' | 'driveEnabled' | 'openDrainEnabled' | 'debounceEnabled'
>;
export type USBPowerExport = Omit<USBPower, 'detectStatus'>;

export interface NpmExport {
    boosts: Boost[];
    charger?: Charger;
    bucks: BuckExport[];
    ldos: LdoExport[];
    gpios: GPIOExport[];
    leds: LED[];
    pof?: POF;
    ship?: ShipModeConfig;
    timerConfig?: TimerConfig;
    fuelGauge: boolean;
    firmwareVersion: string;
    deviceType: NpmModel;
    fuelGaugeChargingSamplingRate: number;
    usbPower?: USBPowerExport;
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

interface DocumentationItem {
    title: React.ReactNode;
    content: React.ReactElement[];
}

export type Documentation = {
    [key: string]: {
        [key: string]: DocumentationItem[];
    };
};
