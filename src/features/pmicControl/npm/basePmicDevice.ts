/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { logger, ShellParser } from '@nordicsemiconductor/pc-nrfconnect-shared';

import { RootState } from '../../../appReducer';
import {
    MAX_TIMESTAMP,
    noop,
    NpmEventEmitter,
    parseBatteryModel,
    parseColonBasedAnswer,
    parseToNumber,
    toRegex,
} from './pmicHelpers';
import {
    AdcSample,
    AdcSampleSettings,
    BatteryModel,
    BatteryModule,
    BatteryProfiler,
    Boost,
    BoostModule,
    Buck,
    BuckModule,
    Charger,
    ChargerModule,
    ErrorLogs,
    FuelGaugeModule,
    GPIO,
    GpioModule,
    Ldo,
    LdoModule,
    LED,
    LEDMode,
    LEDModeValues,
    LoggingEvent,
    LowPowerModule,
    npm1300LowPowerConfig,
    NpmExportLatest,
    NpmExportV2,
    NpmModel,
    PartialUpdate,
    PmicChargingState,
    PmicDialog,
    PmicState,
    POF,
    PofModule,
    PowerID,
    ProfileDownload,
    ResetConfig,
    ResetModule,
    SupportedErrorLogs,
    TimerConfig,
    TimerConfigModule,
    UsbCurrentLimiterModule,
    USBPower,
} from './types';

/* eslint-disable no-underscore-dangle */

export default abstract class BaseNpmDevice {
    private rebooting = false;
    private deviceUptimeToSystemDelta = 0;
    protected lastUptime = 0;
    protected autoReboot = true;
    protected offlineMode: boolean;
    protected uptimeOverflowCounter = 0;
    protected releaseAll: (() => void)[] = [];
    generateOverlay?(npmExport: NpmExportV2): string;
    generateExport?(
        getState: () =>
            | RootState
            | {
                  app: { pmicControl: { npmDevice: BaseNpmDevice } };
              }
    ): NpmExportLatest;

    get deviceType() {
        return this._deviceType;
    }
    get supportedVersion() {
        return this._supportedVersion;
    }
    get supportedErrorLogs() {
        return this._supportedErrorLogs;
    }
    protected _pmicState: PmicState;
    get pmicState() {
        return this._pmicState;
    }
    protected set pmicState(newState: PmicState) {
        this._pmicState = newState;
    }
    protected _boostModule: BoostModule[] = [];
    get boostModule() {
        return [...this._boostModule];
    }
    protected _buckModule: BuckModule[] = [];
    get buckModule() {
        return [...this._buckModule];
    }
    protected _ldoModule: LdoModule[] = [];
    get ldoModule() {
        return [...this._ldoModule];
    }
    protected _gpioModule: GpioModule[] = [];
    get gpioModule() {
        return [...this._gpioModule];
    }
    protected _fuelGaugeModule?: FuelGaugeModule;
    get fuelGaugeModule() {
        return this._fuelGaugeModule;
    }
    protected _batteryModule?: BatteryModule;
    get batteryModule() {
        return this._batteryModule;
    }
    protected _lowPowerModule?: LowPowerModule;
    get lowPowerModule() {
        return this._lowPowerModule;
    }
    protected _resetModule?: ResetModule;
    get resetModule() {
        return this._resetModule;
    }
    protected _timerConfigModule?: TimerConfigModule;
    get timerConfigModule() {
        return this._timerConfigModule;
    }
    protected _usbCurrentLimiterModule?: UsbCurrentLimiterModule;
    get usbCurrentLimiterModule() {
        return this._usbCurrentLimiterModule;
    }
    protected _pofModule?: PofModule;
    get pofModule() {
        return this._pofModule;
    }
    protected _chargerModule?: ChargerModule;
    get chargerModule() {
        return this._chargerModule;
    }
    protected _batteryProfiler?: BatteryProfiler;
    get batteryProfiler() {
        return this._batteryProfiler;
    }

    constructor(
        protected _deviceType: NpmModel,
        protected readonly _supportedVersion: string,
        protected readonly shellParser: ShellParser | undefined,
        protected readonly dialogHandler:
            | ((pmicDialog: PmicDialog) => void)
            | null,
        protected readonly eventEmitter: NpmEventEmitter,
        protected readonly devices: {
            charger: boolean;
            maxEnergyExtraction: boolean;
            noOfBoosts: number;
            noOfBucks: number;
            noOfLdos: number;
            noOfLEDs: number;
            noOfBatterySlots: number;
            noOfGPIOs: number;
        },
        readonly batteryConnectedVoltageThreshold: number,
        private readonly _supportedErrorLogs: SupportedErrorLogs
    ) {
        this._pmicState = shellParser ? 'pmic-connected' : 'ek-disconnected';
        this.offlineMode = !shellParser;

        if (shellParser) {
            this.releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex(
                        '(delayed_reboot [0-1]+)|(kernel reboot (cold|warm))'
                    ),
                    () => {
                        this.rebooting = true;
                        eventEmitter.emit('onReboot', true);
                    },
                    error => {
                        this.rebooting = false;
                        eventEmitter.emit('onReboot', false, error);
                    }
                )
            );

            this.releaseAll.push(
                shellParser.onAnyCommandResponse(
                    ({ command, response, error }) => {
                        const event: LoggingEvent = {
                            timestamp:
                                Date.now() - this.deviceUptimeToSystemDelta,
                            module: 'shell_commands',
                            logLevel: error ? 'err' : 'inf',
                            message: `command: "${command}" response: "${response}"`,
                        };

                        eventEmitter.emit('onLoggingEvent', {
                            loggingEvent: event,
                            dataPair: false,
                        });

                        if (error) {
                            logger.error(
                                response.replaceAll(/(\r\n|\r|\n)/g, ' ')
                            );
                        }
                    }
                )
            );

            this.releaseAll.push(
                shellParser.onUnknownCommand(command => {
                    const event: LoggingEvent = {
                        timestamp: Date.now() - this.deviceUptimeToSystemDelta,
                        module: 'shell_commands',
                        logLevel: 'wrn',
                        message: `unknown command: "${command}"`,
                    };

                    eventEmitter.emit('onLoggingEvent', {
                        loggingEvent: event,
                        dataPair: false,
                    });
                })
            );

            this.releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex(
                        'npm_adc sample',
                        false,
                        undefined,
                        '[0-9]+ [0-9]+'
                    ),
                    res => {
                        const results = parseColonBasedAnswer(res).split(',');
                        const settings: AdcSampleSettings = {
                            samplingRate: 1000,
                            reportRate: 2000,
                        };
                        results.forEach(result => {
                            const pair = result.trim().split('=');
                            if (pair.length === 2) {
                                switch (pair[0]) {
                                    case 'sample interval':
                                        settings.samplingRate = Number.parseInt(
                                            pair[1],
                                            10
                                        );
                                        break;
                                    case 'report interval':
                                        settings.reportRate = Number.parseInt(
                                            pair[1],
                                            10
                                        );
                                        break;
                                }
                            }
                        });
                        this.eventEmitter.emit('onAdcSettingsChange', settings);
                    },
                    noop
                )
            );

            this.releaseAll.push(
                shellParser.registerCommandCallback(
                    toRegex('delayed_reboot', false, undefined, '[0-9]+'),
                    () => {
                        this.pmicState = 'pmic-pending-rebooting';
                        this.eventEmitter.emit(
                            'onPmicStateChange',
                            this.pmicState
                        );
                    },
                    noop
                )
            );

            for (let i = 0; i < this.devices.noOfLEDs; i += 1) {
                this.releaseAll.push(
                    shellParser.registerCommandCallback(
                        toRegex('npmx led mode', true, i, '[0-3]'),
                        res => {
                            const mode = LEDModeValues[parseToNumber(res)];
                            if (mode) {
                                this.eventEmitter.emitPartialEvent<LED>(
                                    'onLEDUpdate',
                                    {
                                        mode,
                                    },
                                    i
                                );
                            }
                        },
                        noop
                    )
                );
            }
        }

        this.updateUptimeOverflowCounter();
    }

    // Return a set of default LED settings
    ledDefaults(): LED[] {
        const defaultLEDs: LED[] = [];
        for (let i = 0; i < this.devices.noOfLEDs; i += 1) {
            defaultLEDs.push({
                mode: LEDModeValues[i],
            });
        }
        return defaultLEDs;
    }

    getLedMode(index: number) {
        return this.sendCommand(`npmx led mode get ${index}`);
    }

    setLedMode(index: number, mode: LEDMode) {
        return new Promise<void>((resolve, reject) => {
            if (this.pmicState === 'ek-disconnected') {
                this.eventEmitter.emitPartialEvent<LED>(
                    'onLEDUpdate',
                    {
                        mode,
                    },
                    index
                );
                resolve();
            } else {
                this.sendCommand(
                    `npmx led mode set ${index} ${LEDModeValues.findIndex(
                        m => m === mode
                    )}`,
                    () => resolve(),
                    () => {
                        this.getLedMode(index);
                        reject();
                    }
                );
            }
        });
    }

    requestUpdate() {
        this.usbCurrentLimiterModule?.get.all();
        this.chargerModule?.get.all();

        this.buckModule.forEach(buck => buck.get.all());
        this.ldoModule.forEach(ldo => ldo.get.all());
        this.gpioModule.forEach(module => module.get.all());
        this.boostModule.forEach(boost => boost.get.all());

        for (let i = 0; i < this.devices.noOfLEDs; i += 1) {
            this.getLedMode(i);
        }

        this.batteryModule?.get.all();
        this.usbCurrentLimiterModule?.get.all();
        this.pofModule?.get.all();
        this.timerConfigModule?.get.all();
        this.lowPowerModule?.get.all();
        this.resetModule?.get.all();
        this.fuelGaugeModule?.get.all();
    }

    protected sendCommand(
        command: string,
        onSuccess: (response: string, command: string) => void = noop,
        onError: (response: string, command: string) => void = noop,
        unique = true
    ) {
        if (this.pmicState !== 'ek-disconnected') {
            this.shellParser?.enqueueRequest(
                command,
                {
                    onSuccess,
                    onError: (error, cmd) => {
                        if (
                            error.includes('IO error') &&
                            this.pmicState === 'pmic-connected'
                        ) {
                            this.pmicState = 'pmic-disconnected';
                            this.eventEmitter.emit(
                                'onPmicStateChange',
                                this.pmicState
                            );
                        }
                        onError(error, cmd);
                    },
                    onTimeout: error => {
                        if (onError) onError(error, command);
                        console.warn(error);
                    },
                },
                undefined,
                unique
            );
        } else {
            onError('No Shell connection', command);
        }
    }

    getKernelUptime() {
        return new Promise<number>((resolve, reject) => {
            this.shellParser?.enqueueRequest(
                'kernel uptime',
                {
                    onSuccess: res => {
                        resolve(parseToNumber(res));
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });
    }

    kernelReset() {
        if (this.rebooting || !this.shellParser) return;
        this.rebooting = true;

        this.eventEmitter.emit('onBeforeReboot', 100);
        this.shellParser.unPause();
        this.shellParser.enqueueRequest(
            'delayed_reboot 100',
            {
                onSuccess: () => {},
                onError: () => {
                    this.rebooting = false;
                },
                onTimeout: error => {
                    this.rebooting = false;
                    console.warn(error);
                },
            },
            undefined,
            true
        );
    }

    private updateUptimeOverflowCounter() {
        this.getKernelUptime().then(milliseconds => {
            this.deviceUptimeToSystemDelta = Date.now() - milliseconds;
            this.uptimeOverflowCounter = Math.floor(
                milliseconds / MAX_TIMESTAMP
            );
        });
    }

    private setupHandler<T, WithError extends boolean = false>(name: string) {
        return (
            handler: WithError extends true
                ? (payload: T, error: string) => void
                : (payload: T) => void
        ) => {
            this.eventEmitter.on(name, handler);
            return () => {
                this.eventEmitter.removeListener(name, handler);
            };
        };
    }

    onPmicStateChange(handler: (payload: PmicState) => void) {
        return this.setupHandler<PmicState>('onPmicStateChange')(handler);
    }
    onAdcSample(handler: (payload: AdcSample) => void) {
        return this.setupHandler<AdcSample>('onAdcSample')(handler);
    }
    onAdcSettingsChange(handler: (payload: AdcSampleSettings) => void) {
        return this.setupHandler<AdcSampleSettings>('onAdcSettingsChange')(
            handler
        );
    }
    onChargingStatusUpdate(
        handler: (payload: PmicChargingState, error: string) => void
    ) {
        return this.setupHandler<PmicChargingState, true>(
            'onChargingStatusUpdate'
        )(handler);
    }
    onChargerUpdate(
        handler: (payload: Partial<Charger>, error: string) => void
    ) {
        return this.setupHandler<Partial<Charger>, true>('onChargerUpdate')(
            handler
        );
    }
    onBatteryAddonBoardIdUpdate(
        handler: (payload: number, error: string) => void
    ) {
        return this.setupHandler<number, true>('onBatteryAddonBoardIdUpdate')(
            handler
        );
    }
    onPowerIdUpdate(handler: (payload: PowerID, error: string) => void) {
        return this.setupHandler<PowerID, true>('onPowerIdUpdate')(handler);
    }
    onTimerExpiryInterrupt(handler: (payload: string, error: string) => void) {
        return this.setupHandler<string, true>('onTimerExpiryInterrupt')(
            handler
        );
    }
    onBoostUpdate(
        handler: (payload: PartialUpdate<Boost>, error: string) => void
    ) {
        return this.setupHandler<PartialUpdate<Boost>, true>('onBoostUpdate')(
            handler
        );
    }
    onBuckUpdate(
        handler: (payload: PartialUpdate<Buck>, error: string) => void
    ) {
        return this.setupHandler<PartialUpdate<Buck>, true>('onBuckUpdate')(
            handler
        );
    }
    onFuelGaugeUpdate(handler: (payload: boolean) => void) {
        return this.setupHandler<boolean>('onFuelGauge')(handler);
    }
    onLdoUpdate(handler: (payload: PartialUpdate<Ldo>, error: string) => void) {
        return this.setupHandler<PartialUpdate<Ldo>, true>('onLdoUpdate')(
            handler
        );
    }
    onGPIOUpdate(
        handler: (payload: PartialUpdate<GPIO>, error: string) => void
    ) {
        return this.setupHandler<PartialUpdate<GPIO>, true>('onGPIOUpdate')(
            handler
        );
    }
    onLEDUpdate(handler: (payload: PartialUpdate<LED>, error: string) => void) {
        return this.setupHandler<PartialUpdate<LED>, true>('onLEDUpdate')(
            handler
        );
    }
    onPOFUpdate(handler: (payload: Partial<POF>, error: string) => void) {
        return this.setupHandler<Partial<POF>, true>('onPOFUpdate')(handler);
    }
    onTimerConfigUpdate(
        handler: (payload: Partial<TimerConfig>, error: string) => void
    ) {
        return this.setupHandler<Partial<TimerConfig>, true>(
            'onTimerConfigUpdate'
        )(handler);
    }
    onLowPowerUpdate(
        handler: (
            payload: Partial<npm1300LowPowerConfig>,
            error: string
        ) => void
    ) {
        return this.setupHandler<Partial<npm1300LowPowerConfig>, true>(
            'onLowPowerUpdate'
        )(handler);
    }
    onResetUpdate(
        handler: (payload: Partial<ResetConfig>, error: string) => void
    ) {
        return this.setupHandler<Partial<ResetConfig>, true>('onResetUpdate')(
            handler
        );
    }
    onLoggingEvent(
        handler: (payload: {
            loggingEvent: LoggingEvent;
            dataPair: boolean;
        }) => void
    ) {
        return this.setupHandler<{
            loggingEvent: LoggingEvent;
            dataPair: boolean;
        }>('onLoggingEvent')(handler);
    }
    onActiveBatteryModelUpdate(handler: (payload: BatteryModel) => void) {
        return this.setupHandler<BatteryModel>('onActiveBatteryModelUpdate')(
            handler
        );
    }
    onStoredBatteryModelUpdate(handler: (payload: BatteryModel[]) => void) {
        return this.setupHandler<BatteryModel[]>('onStoredBatteryModelUpdate')(
            handler
        );
    }
    onBeforeReboot(handler: (payload: number) => void) {
        return this.setupHandler<number>('onBeforeReboot')(handler);
    }
    onReboot(handler: (payload: boolean) => void) {
        return this.setupHandler<boolean>('onReboot')(handler);
    }
    onUsbPower(handler: (payload: Partial<USBPower>) => void) {
        return this.setupHandler<Partial<USBPower>>('onUsbPower')(handler);
    }
    onErrorLogs(handler: (payload: Partial<ErrorLogs>, error: string) => void) {
        return this.setupHandler<Partial<ErrorLogs>, true>('onErrorLogs')(
            handler
        );
    }

    clearErrorLogs(errorOnly?: boolean) {
        if (errorOnly)
            this.eventEmitter.emit('onErrorLogs', {
                chargerError: [],
                sensorError: [],
            });
        else
            this.eventEmitter.emit('onErrorLogs', {
                resetCause: [],
                chargerError: [],
                sensorError: [],
            });
    }

    hasCharger() {
        return this.devices.charger;
    }
    hasMaxEnergyExtraction() {
        return this.devices.maxEnergyExtraction;
    }
    getNumberOfLEDs() {
        return this.devices.noOfLEDs;
    }
    getNumberOfBatteryModelSlots() {
        return this.devices.noOfBatterySlots;
    }

    isSupportedVersion() {
        return new Promise<{ supported: boolean; version: string }>(
            (resolve, reject) => {
                this.shellParser?.enqueueRequest(
                    'app_version',
                    {
                        onSuccess: result => {
                            result = result.replace('app_version=', '');
                            resolve({
                                supported: this._supportedVersion === result,
                                version: result,
                            });
                        },
                        onError: reject,
                        onTimeout: error => {
                            reject(error);
                            console.warn(error);
                        },
                    },
                    undefined,
                    true
                );
            }
        );
    }

    getHwVersion() {
        return new Promise<{
            hw_version: string;
            pca?: string;
            version?: string;
        }>((resolve, reject) => {
            this.shellParser?.enqueueRequest(
                'hw_version',
                {
                    onSuccess: result => {
                        const splitResult = result.split(',');

                        const checkAndReplace = (label: string) =>
                            splitResult
                                .find(item => item.startsWith(label))
                                ?.replace(`${label}=`, '');

                        const labels = ['hw_version', 'version', 'pca'];
                        resolve(
                            labels.reduce(
                                (res, label) => ({
                                    ...res,
                                    [label]: checkAndReplace(label),
                                }),
                                {}
                            ) as {
                                hw_version: string;
                                pca?: string;
                                version?: string;
                            }
                        );
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });
    }
    getPmicVersion() {
        return new Promise<number>((resolve, reject) => {
            this.shellParser?.enqueueRequest(
                'pmic_revision',
                {
                    onSuccess: result => {
                        result = result.replace('pmic_revision=', '');
                        resolve(Number.parseFloat(result));
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });
    }
    isPMICPowered() {
        return new Promise<boolean>((resolve, reject) => {
            this.shellParser?.enqueueRequest(
                'npm_pmic_ping check',
                {
                    onSuccess: result => {
                        resolve(result === 'Pinging PMIC succeeded');
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject(error);
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });
    }

    applyConfig(config: NpmExportLatest) {
        return new Promise<void>(resolve => {
            if (config.deviceType !== 'npm1300') {
                resolve();
                return;
            }

            const action = async () => {
                try {
                    if (config.charger) {
                        const charger = config.charger;
                        await this.chargerModule?.set.all(charger);
                    }

                    await Promise.all(
                        config.boosts.map((boost, index) =>
                            (async () => {
                                await this.boostModule[index].set.all(boost);
                            })()
                        )
                    );

                    if (config.bucks) {
                        await Promise.all(
                            config.bucks.map((buck, index) =>
                                (async () => {
                                    await this.buckModule[index].set.all(buck);
                                })()
                            )
                        );
                    }

                    await Promise.all(
                        config.ldos.map((ldo, index) =>
                            (async () => {
                                await this.ldoModule[index].set.all(ldo);
                            })()
                        )
                    );

                    await Promise.all(
                        config.gpios.map((gpio, index) =>
                            (async () => {
                                await this.gpioModule[index].set.all(gpio);
                            })()
                        )
                    );

                    await Promise.all(
                        config.leds.map((led, index) =>
                            this.setLedMode(index, led.mode)
                        )
                    );

                    if (config.pof) {
                        await this.pofModule?.set.all(config.pof);
                    }

                    if (config.timerConfig) {
                        await this.timerConfigModule?.set.all(
                            config.timerConfig
                        );
                    }

                    if (config.lowPower) {
                        await this.lowPowerModule?.set.all(config.lowPower);
                    }

                    if (config.reset) {
                        await this.resetModule?.set.all(config.reset);
                    }

                    await this.fuelGaugeModule?.set.enabled(
                        config.fuelGaugeSettings.enabled
                    );

                    if (config.usbPower) {
                        await this.usbCurrentLimiterModule?.set.all(
                            config.usbPower
                        );
                    }
                } catch (error) {
                    logger.error('Invalid File.');
                }
            };

            if (config.firmwareVersion == null) {
                logger.error('Invalid File.');
                resolve();
                return;
            }

            if (
                this.dialogHandler &&
                config.firmwareVersion !== this.supportedVersion
            ) {
                const warningDialog: PmicDialog = {
                    doNotAskAgainStoreID: 'pmic1300-load-config-mismatch',
                    message: `The configuration was intended for firmware version ${config.firmwareVersion}. Device is running a different version.
                ${this.supportedVersion}. Do you still want to apply this configuration?`,
                    confirmLabel: 'Yes',
                    optionalLabel: "Yes, don't ask again",
                    cancelLabel: 'No',
                    title: 'Warning',
                    onConfirm: async () => {
                        await action();
                        resolve();
                    },
                    onCancel: () => {
                        resolve();
                    },
                    onOptional: async () => {
                        await action();
                        resolve();
                    },
                };

                this.dialogHandler(warningDialog);
            } else {
                action().finally(resolve);
            }
        });
    }

    getHardcodedBatteryModels() {
        return new Promise<BatteryModel[]>((resolve, reject) => {
            this.shellParser?.enqueueRequest(
                'fuel_gauge model list',
                {
                    onSuccess: result => {
                        const models = result.split(':');
                        if (models.length < 3) reject();
                        const stringModels = models[2].trim().split('\n');
                        const list = stringModels.map(parseBatteryModel);
                        resolve(
                            list.filter(item => item !== null) as BatteryModel[]
                        );
                    },
                    onError: reject,
                    onTimeout: error => {
                        reject();
                        console.warn(error);
                    },
                },
                undefined,
                true
            );
        });
    }
    onProfileDownloadUpdate(
        handler: (payload: ProfileDownload, error?: string) => void
    ) {
        this.eventEmitter.on('onProfileDownloadUpdate', handler);
        return () => {
            this.eventEmitter.removeListener(
                'onProfileDownloadUpdate',
                handler
            );
        };
    }

    setAutoRebootDevice(autoReboot: boolean) {
        if (
            autoReboot &&
            autoReboot !== this.autoReboot &&
            this.pmicState === 'pmic-pending-reboot'
        ) {
            this.kernelReset();
            this.pmicState = 'pmic-pending-rebooting';
            this.eventEmitter.emit('onPmicStateChange', this.pmicState);
        }
        this.autoReboot = autoReboot;
    }

    startAdcSample(intervalMs: number, samplingRate: number) {
        return new Promise<void>((resolve, reject) => {
            this.sendCommand(
                `npm_adc sample ${samplingRate} ${intervalMs}`,
                () => resolve(),
                () => reject()
            );
        });
    }

    stopAdcSample() {
        this.sendCommand(`npm_adc sample 0`);
    }

    release() {
        this.releaseAll.forEach(release => release());
    }

    // Only used in npm2100
    // eslint-disable-next-line class-methods-use-this
    initialize() {}
}
