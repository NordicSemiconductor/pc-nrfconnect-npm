/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Buck,
    Charger,
    FuelGauge,
    GPIO,
    GPIOExport,
    Ldo,
    LED,
    LowPowerConfig,
    npm1300LowPowerConfig,
    npm1300TimerConfig,
    npm1300TimeToActive,
    NpmExportLatest,
    PartialUpdate,
    PmicDialog,
    POF,
    ResetConfig,
    TimerConfig,
    USBPower,
} from '../../types';
import { toBuckExport } from '../buck';
import { GPIOMode1300, GPIOPull1300 } from '../gpio/types';
import { toLdoExport } from '../ldo';
import { npm1300FWVersion } from '../pmic1300Device';
import { npm1300TimerMode } from '../timerConfig/types';
import { setupMocksBase } from './helpers';

describe('PMIC 1300 - Apply Config ', () => {
    const {
        mockOnChargerUpdate,
        mockOnBuckUpdate,
        mockOnLdoUpdate,
        mockOnGpioUpdate,
        mockOnLEDUpdate,
        mockOnPOFUpdate,
        mockOnLowPowerUpdate,
        mockOnResetUpdate,
        mockOnTimerConfigUpdate,
        mockOnFuelGaugeUpdate,
        mockDialogHandler,
        mockOnUsbPower,
        pmic,
    } = setupMocksBase();

    const initCharger: Charger = {
        vTerm: -1,
        vTrickleFast: 2.9,
        iChg: -1,
        enabled: true,
        enableRecharging: true,
        enableVBatLow: false,
        iTerm: 20,
        iBatLim: 1340,
        ntcThermistor: '10 kΩ',
        ntcBeta: 3380,
        tChgStop: 10,
        tChgResume: 110,
        vTermR: 4,
        tCold: 1,
        tCool: 12,
        tWarm: 47,
        tHot: 69,
    };

    const initBuck: Buck = {
        vOutNormal: -1,
        vOutRetention: -1,
        mode: 'software',
        enabled: false,
        modeControl: 'GPIO0',
        onOffControl: 'GPIO0',
        onOffSoftwareControlEnabled: false,
        retentionControl: 'GPIO0',
        activeDischarge: false,
    };

    const initLdo: Ldo = {
        voltage: -1,
        mode: 'LDO',
        enabled: true,
        softStartEnabled: true,
        softStart: 20,
        activeDischarge: false,
        onOffControl: 'GPIO0',
        onOffSoftwareControlEnabled: false,
    };

    const initLed: LED = {
        mode: 'Charger error',
    };

    const initPOF: POF = {
        enable: true,
        threshold: 2.8,
        polarity: 'Active high',
    };

    const initTimerConfig: TimerConfig = {
        mode: npm1300TimerMode['Boot monitor'],
        prescaler: 'Slow',
        period: 0,
    };

    const initShip: npm1300LowPowerConfig = {
        timeToActive: npm1300TimeToActive['96ms'],
        invPolarity: false,
    };
    const initReset: ResetConfig = {
        longPressReset: 'two_button',
    };

    const initUSBPower: Omit<USBPower, 'detectStatus'> = {
        currentLimiter: 100,
    };

    const sampleConfig: NpmExportLatest = {
        boosts: [],
        charger: {
            vTerm: 3.5,
            vTrickleFast: 2.5,
            iChg: 32,
            enabled: false,
            iTerm: 10,
            iBatLim: 270,
            enableRecharging: false,
            enableVBatLow: false,
            ntcThermistor: '100 kΩ',
            ntcBeta: 3480,
            tChgStop: 20,
            tChgResume: 120,
            vTermR: 5,
            tCold: 10,
            tCool: 20,
            tWarm: 50,
            tHot: 80,
        },
        bucks: [
            {
                vOutNormal: 1,
                vOutRetention: 1,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO0',
                onOffControl: 'GPIO1',
                retentionControl: 'GPIO2',
                activeDischarge: true,
            },
            {
                vOutNormal: 2,
                vOutRetention: 2,
                mode: 'vSet',
                enabled: true,
                modeControl: 'GPIO1',
                onOffControl: 'GPIO2',
                retentionControl: 'GPIO3',
                activeDischarge: true,
            },
        ],
        ldos: [
            {
                voltage: 1,
                mode: 'Load_switch',
                enabled: false,
                softStartEnabled: false,
                softStart: 50,
                activeDischarge: true,
                onOffControl: 'GPIO1',
            },
            {
                voltage: 2,
                mode: 'Load_switch',
                enabled: false,
                softStartEnabled: false,
                softStart: 50,
                activeDischarge: false,
                onOffControl: 'GPIO2',
            },
        ],
        gpios: [
            {
                mode: GPIOMode1300.Input,
                pull: GPIOPull1300['Pull down'],
                drive: 6,
                openDrain: false,
                debounce: false,
            },
            {
                mode: GPIOMode1300['Input falling edge event'],
                pull: GPIOPull1300['Pull down'],
                drive: 6,
                openDrain: true,
                debounce: true,
            },
            {
                mode: GPIOMode1300['Input logic 0'],
                pull: GPIOPull1300['Pull down'],
                drive: 1,
                openDrain: false,
                debounce: true,
            },
            {
                mode: GPIOMode1300['Output logic 0'],
                pull: GPIOPull1300['Pull down'],
                drive: 1,
                openDrain: true,
                debounce: false,
            },
            {
                mode: GPIOMode1300['Output power loss warning'],
                pull: GPIOPull1300['Pull down'],
                drive: 1,
                openDrain: false,
                debounce: false,
            },
        ],
        leds: [
            {
                mode: 'Charger error',
            },
            {
                mode: 'Charging',
            },
            {
                mode: 'Not used',
            },
        ],
        pof: {
            enable: false,
            threshold: 2.4,
            polarity: 'Active low',
        },
        timerConfig: {
            mode: npm1300TimerMode['General purpose'],
            prescaler: 'Fast',
            period: 10,
        },
        lowPower: {
            timeToActive: npm1300TimeToActive['16ms'],
            invPolarity: true,
        },
        reset: {
            longPressReset: 'one_button',
        },
        fuelGaugeSettings: {
            enabled: true,
            chargingSamplingRate: 1000,
        },
        firmwareVersion: npm1300FWVersion,
        deviceType: 'npm1300',
        usbPower: {
            currentLimiter: 500,
        },
        fileFormatVersion: 2,
    };

    const initGPIO: GPIOExport = {
        mode: GPIOMode1300['Input falling edge event'],
        pull: GPIOPull1300['Pull down'],
        drive: 6,
        openDrain: false,
        debounce: false,
    };

    let charger: Charger | undefined;
    let bucks: Buck[] = [];
    let ldos: Ldo[] = [];
    let gpios: GPIO[] = [];
    let leds: LED[] = [];
    let pof: POF = { ...initPOF };
    let ship: npm1300LowPowerConfig = { ...initShip };
    let reset: ResetConfig = { ...initReset };
    let timerConfig = { ...initTimerConfig };
    let usbPower = { ...initUSBPower };

    beforeEach(() => {
        jest.clearAllMocks();

        charger = undefined;
        bucks = [];
        ldos = [];
        gpios = [];
        leds = [];
        pof = { ...initPOF };
        ship = { ...initShip };
        reset = { ...initReset };
        timerConfig = { ...initTimerConfig };

        mockOnChargerUpdate.mockImplementation(
            (partialUpdate: Partial<Charger>) => {
                charger = {
                    ...(charger ?? initCharger),
                    ...partialUpdate,
                };
            }
        );

        mockOnBuckUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<Buck>) => {
                bucks[partialUpdate.index] = {
                    ...(bucks[partialUpdate.index] ?? initBuck),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnLdoUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<Ldo>) => {
                ldos[partialUpdate.index] = {
                    ...(ldos[partialUpdate.index] ?? initLdo),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnGpioUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<GPIO>) => {
                delete partialUpdate.data.pullEnabled;
                delete partialUpdate.data.debounceEnabled;
                delete partialUpdate.data.driveEnabled;
                delete partialUpdate.data.openDrainEnabled;

                gpios[partialUpdate.index] = {
                    ...(gpios[partialUpdate.index] ?? initGPIO),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnLEDUpdate.mockImplementation(
            (partialUpdate: PartialUpdate<LED>) => {
                leds[partialUpdate.index] = {
                    ...(leds[partialUpdate.index] ?? initLed),
                    ...partialUpdate.data,
                };
            }
        );

        mockOnPOFUpdate.mockImplementation((partialUpdate: Partial<POF>) => {
            pof = {
                ...pof,
                ...partialUpdate,
            };
        });

        mockOnLowPowerUpdate.mockImplementation(
            (partialUpdate: Partial<LowPowerConfig>) => {
                ship = {
                    ...ship,
                    ...partialUpdate,
                } as npm1300LowPowerConfig;
            }
        );

        mockOnResetUpdate.mockImplementation(
            (partialUpdate: Partial<ResetConfig>) => {
                reset = {
                    ...reset,
                    ...partialUpdate,
                };
            }
        );

        mockOnTimerConfigUpdate.mockImplementation(
            (partialUpdate: Partial<TimerConfig>) => {
                timerConfig = {
                    ...timerConfig,
                    ...partialUpdate,
                } as npm1300TimerConfig;
            }
        );

        mockOnUsbPower.mockImplementation(
            (partialUpdate: Partial<USBPower>) => {
                usbPower = {
                    ...usbPower,
                    ...partialUpdate,
                };
            }
        );
    });

    const verifyApplyConfig = () => {
        expect(charger).toStrictEqual(sampleConfig.charger);

        expect(bucks.map(toBuckExport)).toStrictEqual(sampleConfig.bucks);

        expect(ldos.map(toLdoExport)).toStrictEqual(sampleConfig.ldos);

        expect(gpios).toStrictEqual(sampleConfig.gpios);

        expect(mockOnChargerUpdate).toBeCalledTimes(17);
        expect(mockOnBuckUpdate).toBeCalledTimes(18); // 7 states + 1 (mode change on vOut) * 2 Bucks
        expect(mockOnLdoUpdate).toBeCalledTimes(14);
        expect(mockOnGpioUpdate).toBeCalledTimes(25);
        expect(mockOnLEDUpdate).toBeCalledTimes(3);
        expect(mockOnPOFUpdate).toBeCalledTimes(3);
        expect(mockOnLowPowerUpdate).toBeCalledTimes(1);
        expect(mockOnResetUpdate).toBeCalledTimes(1);
        expect(mockOnTimerConfigUpdate).toBeCalledTimes(3);

        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(2);
        expect(mockOnFuelGaugeUpdate).toBeCalledWith({
            enabled: true,
        } satisfies Partial<FuelGauge>);

        expect(mockOnUsbPower).toBeCalledTimes(1);
    };

    test('Apply Correct config', async () => {
        await pmic.applyConfig(sampleConfig);
        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Yes', async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onConfirm();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test("Apply wrong firmware version -- Yes, Don't ask again", async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            if (dialog.onOptional) dialog.onOptional();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        verifyApplyConfig();
    });

    test('Apply wrong firmware version -- Cancel', async () => {
        mockDialogHandler.mockImplementationOnce((dialog: PmicDialog) => {
            dialog.onCancel?.();
        });

        await pmic.applyConfig({ ...sampleConfig, firmwareVersion: '0.0.0+9' });

        expect(mockDialogHandler).toBeCalledTimes(1);

        expect(mockOnChargerUpdate).toBeCalledTimes(0);
        expect(mockOnBuckUpdate).toBeCalledTimes(0);
        expect(mockOnLdoUpdate).toBeCalledTimes(0);
        expect(mockOnFuelGaugeUpdate).toBeCalledTimes(0);
    });
});
export {};
